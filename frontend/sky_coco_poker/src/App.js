import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
// import Users from './user/pages/Users';
// import NewPlace from './places/pages/NewPlace';
// import UserPlaces from './places/pages/UserPlaces';
// import UpdatePlace from './places/pages/UpdatePlace';
// import Auth from './user/pages/Auth';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';

const Home = React.lazy(() => import('./home/pages/Home'));
const UserContainer = React.lazy(() => import('./user/components/UserContainer'));
const Auth = React.lazy(() => import('./home/pages/Auth'));
const MainGameContainer = React.lazy(() => import('./game/components/MainGameContainer'));

const App = () => {

    const {token, login, logout, userId} = useAuth();

    let routes;

    if (token) {
        routes = (
            <Switch>
              <Route path="/" exact>
                <Home/>
              </Route>
              <Route path="/game/" exact>
                <MainGameContainer/>
              </Route>
              <Route path="/user/" exact>
                <UserContainer/>
              </Route>
              <Redirect to="/"/>
            </Switch>
        );
    } else {
        routes = (
            <Switch>
              <Route path="/" exact>
                <Home/>
              </Route>
              <Route path="/auth">
                <Auth/>
              </Route>
              <Redirect to="/auth"/>
            </Switch>
        );
    }

    return (
        <AuthContext.Provider value={{isLoggedIn: !!token, token: token, userId:userId, login: login, logout: logout}}>
          <Router>
          <MainNavigation/>
            <main>
              <Suspense fallback={<div className="center"><LoadingSpinner></LoadingSpinner></div>}>
                {routes}
              </Suspense>
            </main>
          </Router>
        </AuthContext.Provider>
    );
}

export default App;
