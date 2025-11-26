//Import Router Stuff
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./assets/context/AuthContext.jsx";
import { OutletSessionProvider } from "./assets/context/OutletSessionContext.jsx";
import { SocketProvider } from "./assets/context/SocketContext.jsx";

//Import Pages
const Layout = lazy(() => import("./assets/pages/Layout"));
const Error = lazy(() => import("./assets/pages/Error"));
const ErrorDB = lazy(() => import("./assets/pages/ErrorDB"));
const Home = lazy(() => import("./assets/pages/Home"));
const LeaveQueue = lazy(() => import("./assets/pages/LeaveQueue.jsx"));
const Register = lazy(() => import("./assets/pages/Register"));

//Import Pages From Account
const Login = lazy(() => import("./assets/pages/account/Login.jsx"));
const Logout = lazy(() => import("./assets/pages/account/Logout.jsx"));
const Settings = lazy(() => import("./assets/pages/account/Settings.jsx"));
const SettingsAccount = lazy(() =>
  import("./assets/pages/account/SettingsAccount.jsx")
);
const SettingsOutlet = lazy(() =>
  import("./assets/pages/account/SettingsOutlet.jsx")
);
const AuditLogs = lazy(() => import("./assets/pages/account/AuditLogs.jsx"));
const AllOutlets = lazy(() => import("./assets/pages/account/AllOutlets.jsx"));
const NewOutlet = lazy(() => import("./assets/pages/account/NewOutlet.jsx"));
const InactiveOutlet = lazy(() =>
  import("./assets/pages/account/InactiveOutlet.jsx")
);
const ActiveOutlet = lazy(() =>
  import("./assets/pages/account/ActiveOutlet.jsx")
);
const KioskView = lazy(() => import("./assets/pages/customer/KioskView.jsx"));
const KioskSuccess = lazy(() =>
  import("./assets/pages/customer/KioskSuccess.jsx")
);
const KioskWaiting = lazy(() =>
  import("./assets/pages/customer/KioskWaiting.jsx")
);
const IndividualOutlet = lazy(() =>
  import("./assets/pages/account/IndividualOutlet.jsx")
);
const StaffManagement = lazy(() =>
  import("./assets/pages/account/StaffManagement.jsx")
);
const QRCode = lazy(() => import("./assets/components/QRCode.jsx"));
const Customers = lazy(() => import("./assets/pages/account/Customers.jsx"));

//Import Pages From Customer
const AccountLanding = lazy(() =>
  import("./assets/pages/customer/AccountLanding")
);
const OutletLanding = lazy(() =>
  import("./assets/pages/customer/OutletLanding.jsx")
);
const JoinQueue = lazy(() => import("./assets/pages/customer/JoinQueue.jsx"));
const Waiting = lazy(() => import("./assets/pages/customer/Waiting.jsx"));

//Import Components
import ProtectedRoutes from "./assets/components/ProtectedRoutes";
import Sidenav from "./assets/components/Sidenav.jsx";
import LocalStorageCheck from "./assets/components/LocalStorageCheck.jsx";
import Loading from "./assets/components/Loading.jsx";
import HeaderNav from "./assets/components/HeaderNav.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense
        fallback={
          <Loading
            title={"App "}
            paragraph={"Sorry, it might take awhile for the app to wake up. "}
          />
        }
      >
        <Layout />
      </Suspense>
    ),
    children: [
      //home
      {
        path: "/",
        element: (
          <Suspense
            fallback={
              <Loading
                title={"App "}
                paragraph={
                  "Sorry, it might take awhile for the app to wake up. "
                }
              />
            }
          >
            <div>
              <HeaderNav />
              <Home />
            </div>
          </Suspense>
        ),
      },
      //customer facing
      {
        path: ":acctSlug",
        element: (
          <div className="">
            <LocalStorageCheck />
            <Outlet />
          </div>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense
                fallback={
                  <Loading
                    title={"App "}
                    paragraph={
                      "Sorry, it might take awhile for the app to wake up. "
                    }
                  />
                }
              >
                <AccountLanding />
              </Suspense>
            ),
          },
          {
            path: "outlet/:outletId",
            element: (
              <Suspense
                fallback={
                  <Loading
                    title={"App "}
                    paragraph={
                      "Sorry, it might take awhile for the app to wake up. "
                    }
                  />
                }
              >
                <SocketProvider>
                  <OutletLanding />
                </SocketProvider>
              </Suspense>
            ),
            children: [
              {
                path: "kiosk/:queueId",
                element: <KioskView />,
              },
            ],
          },
          {
            path: "kiosk/:queueItem",
            children: [
              {
                path: "success",
                // This path is still within the kiosk
                element: (
                  <SocketProvider>
                    <KioskSuccess />
                  </SocketProvider>
                ),
              },
              {
                path: "qrScanned",
                // This path is for when the customer has scanned the qr code to get to their waiting page
                element: <KioskWaiting />,
              },
            ],
          },
          {
            path: "join/:queueId",
            element: (
              <Suspense
                fallback={
                  <Loading
                    title={"App "}
                    paragraph={
                      "Sorry, it might take awhile for the app to wake up. "
                    }
                  />
                }
              >
                <JoinQueue />
              </Suspense>
            ),
          },
          {
            path: "queueItem/:queueItem",
            element: (
              <SocketProvider>
                <Suspense
                  fallback={
                    <Loading
                      title={"App "}
                      paragraph={
                        "Sorry, it might take awhile for the app to wake up. "
                      }
                    />
                  }
                >
                  <Waiting />
                </Suspense>
              </SocketProvider>
            ),
          },
          {
            path: "leftQueue/:queueItem",
            element: (
              <Suspense
                fallback={
                  <Loading
                    title={"App "}
                    paragraph={
                      "Sorry, it might take awhile for the app to wake up. "
                    }
                  />
                }
              >
                <LeaveQueue />
              </Suspense>
            ),
          },
          { path: "seated/:queueItem", element: <Waiting /> },
        ],
      },
      //account facing
      {
        path: "/db",
        element: (
          <OutletSessionProvider>
            <AuthProvider>
              <Suspense
                fallback={
                  <Loading
                    title={"App "}
                    paragraph={
                      "Sorry, it might take awhile for the app to wake up. "
                    }
                  />
                }
              >
                <Outlet />
              </Suspense>
            </AuthProvider>
          </OutletSessionProvider>
        ),
        children: [
          {
            path: "register",
            element: (
              <div className="">
                <HeaderNav />
                <Register />
              </div>
            ),
          },
          {
            path: "login",
            element: (
              <div className="">
                <HeaderNav />
                <Login />
              </div>
            ),
          },
          //TODO: forgotpassword,
          {
            path: ":accountId",
            element: (
              <ProtectedRoutes>
                <div className="h-full w-full lg:grid lg:grid-cols-5 top-0 left-0 absolute lg:relative">
                  <Sidenav />
                  <div className="lg:col-span-4 relative">
                    <Outlet />
                  </div>
                </div>
              </ProtectedRoutes>
            ),
            children: [
              {
                //* ALL OUTLETS
                path: "outlets",
                // element: <Outlet />,
                children: [
                  {
                    path: "new",
                    element: <NewOutlet />,
                  },
                  {
                    path: "all",
                    element: <AllOutlets />,
                  },

                  {
                    path: "qr/:outletId",
                    element: <QRCode />,
                  },
                ],
              },
              {
                path: "quit",
                element: <Logout />,
              },
              {
                //* SETTINGS PAGE
                path: "settings",
                element: (
                  <SocketProvider>
                    <Suspense
                      fallback={
                        <Loading
                          title={"App "}
                          paragraph={
                            "Sorry, it might take awhile for the app to wake up. "
                          }
                        />
                      }
                    >
                      <Settings />
                    </Suspense>
                  </SocketProvider>
                ),
                children: [
                  {
                    path: "account",
                    element: <SettingsAccount />,
                    children: [
                      {
                        path: "auditlogs",
                        element: <AuditLogs />,
                      },
                    ],
                  },
                  {
                    path: "outlet",
                    element: <SettingsOutlet />,
                    children: [
                      {
                        path: ":outletId/auditlogs",
                        element: <AuditLogs />,
                      },
                    ],
                  },
                ],
                //element: settings -- set the outlet settings, egs. how long the default estimated wait time is. add new outlets. pay monies to me yay.
                //To edit info such as default estimated wait time, name, address, location map links, waze links, hours open, etc. (So this should be an editable form)
              },
              {
                //* INDIVIDUAL OUTLET
                path: "outlet/:outletId",
                element: <IndividualOutlet />,
                children: [
                  {
                    path: "inactive",
                    element: <InactiveOutlet />,
                  },
                  {
                    path: "active/:queueId",
                    element: (
                      <SocketProvider>
                        <Suspense
                          fallback={
                            <Loading
                              title={"App "}
                              paragraph={
                                "Sorry, it might take awhile for the app to wake up. "
                              }
                            />
                          }
                        >
                          <ActiveOutlet />
                        </Suspense>
                      </SocketProvider>
                    ),
                  },
                ],
              },
              {
                path: "VIPs",
                element: <Customers />,
              },
              {
                path: "staff",
                element: <StaffManagement />,
              },
            ],
          },
          { path: "*", element: <ErrorDB /> },
        ],
      },
      { path: "*", element: <Error /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
