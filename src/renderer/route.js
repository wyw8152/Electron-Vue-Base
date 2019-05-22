import Home from './pages/Home';
import loginPage from './pages/LoginPage';
import menus from './menu';

const childrenRoutes = [];

for (const menu of menus) {
  childrenRoutes.push(menu);
}

childrenRoutes.push({
  path: '/',
  redirect: menus[0].path,
});

const routes = [
  {
    path: '/',
    name: 'loginPage',
    component: loginPage
  },
  {
    path: '/home',
    // name: 'home',
    component: Home,
    children: childrenRoutes,
  },
];

export default routes;
