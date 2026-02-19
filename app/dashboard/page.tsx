"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  ClipboardList,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import Spinner from "../../components/Spinner";

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("USER");
  const [userName, setUserName] = useState<string>("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    inProgress: 0,
    completed: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    let mounted = true;
    let renderCount = 0;
    renderCount++;

    console.log("[PAGE] 🚀 useEffect triggered", {
      renderCount,
      statsLoading,
      hasSession: !!session,
      userRole,
      timestamp: new Date().toISOString(),
    });

    // CRITICAL FIX: Page should wait for layout to provide session
    // Don't use aggressive timeout - layout handles session management
    const timeout = setTimeout(() => {
      if (mounted && statsLoading) {
        console.warn(
          "[PAGE] ⏰ Loading timeout (but layout may still be loading)",
          {
            renderCount,
            timestamp: new Date().toISOString(),
          },
        );
        // Don't force loading false - layout controls session state
        // Just log the warning
      }
    }, 10000); // Longer timeout since layout handles session

    const init = async () => {
      try {
        console.log("[PAGE] 🔄 Init started", {
          renderCount,
          timestamp: new Date().toISOString(),
        });

        // CRITICAL FIX: Get session for stats, but don't treat null as error
        // Layout is the source of truth for session - if layout rendered this page,
        // session should exist. But getSession() might return null temporarily.
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log("[PAGE] 📊 Session check (for stats only)", {
          hasSession: !!currentSession,
          userId: currentSession?.user?.id,
          error: sessionError?.message,
          timestamp: new Date().toISOString(),
        });

        if (!mounted) return;

        // Set session for stats, but don't fail if null
        // Layout controls whether we should be here
        setSession(currentSession);

        if (currentSession?.user?.id) {
          // CRITICAL FIX: Don't fetch profile again - layout already has it
          // Instead, we'll get role from props or context, but for now
          // we'll fetch it once more but only if we don't have it
          // Actually, let's fetch it but log that layout should have it
          console.log("[PAGE] 🔍 Fetching profile from users table for stats", {
            userId: currentSession.user.id,
            timestamp: new Date().toISOString(),
          });

          // CRITICAL: Role MUST come from users table, NOT from auth
          // Fetch from users table to get role for determining stats queries
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("role, name")
            .eq("id", currentSession.user.id)
            .single(); // Use single() for better type safety

          // Type assertion for partial select result
          type ProfileResult = { role: string; name: string } | null;
          const typedProfile = profile as ProfileResult;

          console.log("[PAGE] 📊 Profile fetch response from users table", {
            hasData: !!typedProfile,
            role: typedProfile?.role, // From users.role column
            name: typedProfile?.name,
            error: profileError?.message,
            timestamp: new Date().toISOString(),
          });

          let profileData = null;
          if (typedProfile && !profileError) {
            // CRITICAL: Role comes from users.role, validate it
            const validRole =
              typedProfile.role &&
              ["ADMIN", "MANAGER", "USER"].includes(typedProfile.role)
                ? typedProfile.role
                : "USER";

            profileData = { role: validRole, name: typedProfile.name || "" };

            // Only update if we don't already have it (to avoid flicker)
            if (!userRole || userRole === "USER") {
              setUserRole(validRole); // From users table, not auth
            }
            if (!userName) {
              setUserName(typedProfile.name || "");
            }
            console.log("[PAGE] ✅ Profile loaded from users table", {
              role: validRole, // Confirmed: from users.role
              name: typedProfile.name,
              timestamp: new Date().toISOString(),
            });
          } else {
            if (!userName) {
              setUserName(currentSession.user.email?.split("@")[0] || "Member");
            }
            console.log(
              "[PAGE] ⚠️ No profile found in users table, using email",
              {
                error: profileError?.message,
                timestamp: new Date().toISOString(),
              },
            );
            // Default to USER role if profile not found
            if (!userRole || userRole === "USER") {
              profileData = { role: "USER", name: "" };
            }
          }

          // 2. Prepare queries based on role
          let jobsQuery = (supabase as any)
            .from("jobs")
            .select("status", { count: "exact" });

          const isSystemAdmin = profileData && profileData.role === "ADMIN";
          let usersQuery = isSystemAdmin
            ? (supabase as any)
                .from("users")
                .select("id", { count: "exact", head: true })
            : null;

          // If not admin/manager, filter jobs by staff_id
          const isSystemStaff = profileData && profileData.role === "USER";
          if (isSystemStaff) {
            jobsQuery = jobsQuery.eq("staff_id", currentSession.user.id);
          } else if (!profileData) {
            jobsQuery = jobsQuery.eq("staff_id", currentSession.user.id);
          }

          console.log("[PAGE] 📊 Fetching stats", {
            isSystemAdmin,
            isSystemStaff,
            timestamp: new Date().toISOString(),
          });

          // 3. Fetch stats in parallel
          // 4. Fetch recent jobs for non-admin users
          let recentJobsQuery = null;
          if (isSystemStaff || !isSystemAdmin) {
            recentJobsQuery = (supabase as any)
              .from("jobs")
              .select(
                `
                *,
                service:services(name),
                vendor:vendors(studio_name)
              `,
              )
              .eq("staff_id", currentSession.user.id)
              .order("created_at", { ascending: false })
              .limit(5);
          }

          const [jobsResponse, usersResponse, recentJobsResponse] =
            await Promise.all([
              jobsQuery,
              usersQuery || Promise.resolve({ count: 0 }),
              recentJobsQuery || Promise.resolve({ data: [] }),
            ]);

          const { data: jobs, count: totalJobs } = jobsResponse;
          const { count: totalUsers } = usersResponse;
          const { data: recentJobsData } = recentJobsResponse;

          const safeJobs = (jobs || []) as { status: string }[];

          console.log("[PAGE] 📊 Stats loaded", {
            totalJobs: totalJobs || 0,
            inProgress: safeJobs.filter((j) => j.status === "IN_PROGRESS")
              .length,
            completed: safeJobs.filter((j) => j.status === "COMPLETED").length,
            totalUsers: totalUsers || 0,
            recentJobsCount: recentJobsData?.length || 0,
            timestamp: new Date().toISOString(),
          });

          if (mounted) {
            setStats({
              totalJobs: totalJobs || 0,
              inProgress: safeJobs.filter((j) => j.status === "IN_PROGRESS")
                .length,
              completed: safeJobs.filter((j) => j.status === "COMPLETED")
                .length,
              totalUsers: totalUsers || 0,
            });
            setRecentJobs(recentJobsData || []);
          }
        } else {
          console.log("[PAGE] ⚠️ No session found for stats", {
            timestamp: new Date().toISOString(),
          });
          // CRITICAL FIX: Don't treat this as error
          // Layout controls session - if we're here, layout allowed it
          // Session might just not be available yet for stats
          // Don't set loading false - let layout control that
        }
      } catch (err) {
        console.error("[PAGE] ❌ Unexpected error in init:", err);
        // CRITICAL FIX: Set loading to false on error
        if (mounted) {
          setStatsLoading(false);
        }
      } finally {
        if (mounted) {
          console.log("[PAGE] 🏁 Init finally - setting loading to false", {
            renderCount,
            timestamp: new Date().toISOString(),
          });
          setStatsLoading(false);
          clearTimeout(timeout);
        }
      }
    };
    init();
    return () => {
      console.log("[PAGE] 🧹 Cleanup", {
        timestamp: new Date().toISOString(),
      });
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  // CRITICAL FIX: Page should trust layout's session management
  // If layout rendered this page, we should render content
  // Don't return null based on page's own session check
  const isLoading = statsLoading;

  console.log("[PAGE] 🎨 Render check", {
    statsLoading,
    hasSession: !!session,
    userRole,
    userName,
    isLoading,
    timestamp: new Date().toISOString(),
  });

  // CRITICAL FIX: Don't return null based on page's session state
  // Layout controls whether we should be here - if layout rendered us, render content
  // Only return null if we're explicitly in an error state
  // Layout will handle redirects if needed

  const isAdmin = userRole === "ADMIN";

  return (
    <main className="lg:ml-[var(--sidebar-offset)] p-4 lg:p-6 relative">
      <div className="max-w-full mx-auto">
        {/* Welcome Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-black mb-2">
            Welcome back,{" "}
            <span className="text-indigo-600">
              {userName || "Studio Member"}!
            </span>
          </h2>
          {isLoading && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Spinner className="w-5" />
              Loading dashboard stats...
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-aesthetic p-6 overflow-hidden group hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Total Jobs
                </p>
                <p className="text-3xl font-normal font-heading text-black">
                  {stats.totalJobs}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <ClipboardList size={22} />
              </div>
            </div>
          </div>

          <div className="card-aesthetic p-6 group hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  In-Progress
                </p>
                <p className="text-3xl font-normal font-heading text-black">
                  {stats.inProgress}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <Clock size={22} />
              </div>
            </div>
          </div>

          <div className="card-aesthetic p-6 group hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Completed
                </p>
                <p className="text-3xl font-normal font-heading text-black">
                  {stats.completed}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="card-aesthetic p-6 group hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Total Users
                  </p>
                  <p className="text-3xl font-normal font-heading text-black">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Users size={22} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Jobs Section for Staff/User */}
        {!isAdmin && recentJobs.length > 0 && (
          <div className="card-aesthetic p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center">
                  <ClipboardList size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Recent Jobs
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Your latest assignments
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/staff/my-jobs"
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 text-sm font-bold transition-colors"
              >
                <span>View All</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-3">
              {recentJobs.map((job: any) => (
                <Link
                  key={job.id}
                  href={`/dashboard/staff/my-jobs/view/${job.id}`}
                  className="block group"
                >
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors shrink-0">
                          <Building2 size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {job.service?.name || "Job"}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {job.vendor?.studio_name || "Individual"} •{" "}
                            {job.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 ml-4 shrink-0">
                        <div className="flex items-center text-xs text-slate-500 font-medium">
                          <Calendar
                            size={12}
                            className="mr-1.5 text-slate-400"
                          />
                          {new Date(job.job_due_date).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            job.status === "COMPLETED"
                              ? "bg-emerald-500 text-white"
                              : job.status === "PENDING"
                                ? "bg-amber-400 text-white"
                                : "bg-indigo-600 text-white"
                          }`}
                        >
                          {job.status === "IN_PROGRESS"
                            ? "IN-PROGRESS"
                            : job.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
