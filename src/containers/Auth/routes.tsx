
import LoginGuard from 'core/services/auth/guards/LoginGuard';
import Login from 'components/Login';
// import ForgottenPassword from 'components/ForgottenPassword';
import LogoutGuard from 'core/services/auth/guards/LogoutGuard';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import Logout from 'components/Logout';
import { AUTH_ROUTER_PATHS, AUTH_ROUTE_PREFIX } from 'core/Constants';

export type ResetPasswordParams = {
  passwordResetToken: string;
};

export type ActivateAccountParams = {
  userId: string;
  activationToken: string;
};

const LoginPage = LoginGuard(Login);
const LogoutPage = LogoutGuard(Logout);
// const ForgottenPasswordPage = IsAnonymous(ForgottenPassword);

const AuthRoutes = () => (
  <Router>
    <Route exact path={AUTH_ROUTE_PREFIX} render={() => <Redirect to={AUTH_ROUTER_PATHS.login} />} />
    <Route exact path={AUTH_ROUTER_PATHS.login} component={LoginPage} />
    <Route exact path={AUTH_ROUTER_PATHS.logout} component={LogoutPage} />
    {/* <Route exact path={AUTH_ROUTER_PATHS.forgottenPassword} component={ForgottenPasswordPage} /> */}
  </Router>
);

export default AuthRoutes;
