import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary"
import LoadingScreen from "components/LoadingScreen/LoadingScreen"
import { store, StorePersistGate } from "core/store"
import { Suspense } from "react"
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import { rootPath } from "core/Config";
import AuthRoutes from "./Auth/routes";
import NotFound from "components/NotFound/NotFound";
import { Route, Switch } from "react-router";
import GlobalLoader from "components/GlobalLoader/GlobalLoader";
import RootLayout from "./RootLayout/RootLayout";
import { AUTH_ROUTE_PREFIX } from "core/Constants";
import history from "core/History";

function Root() {
  return (
    <ErrorBoundary>
    <Suspense fallback={<LoadingScreen />}>
      <Provider store={store}>
        <StorePersistGate>
          <ConnectedRouter history={history}>
            <GlobalLoader>
              <Switch>
                <Route exact path={rootPath} component={RootLayout} />
                <Route path={AUTH_ROUTE_PREFIX} component={AuthRoutes} />
                <Route component={NotFound} />
              </Switch>
            </GlobalLoader>
          </ConnectedRouter>
        </StorePersistGate>
      </Provider>
    </Suspense>
  </ErrorBoundary>
  )
}

export default Root