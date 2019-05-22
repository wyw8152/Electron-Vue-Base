import Chat from './pages/menu/Chat.vue';
import History from './pages/menu/History.vue';

const menu = [
  {
    icon: 'ios-chatbubbles',
    title: '当前会话',
    path: '/chat',
    component: Chat,
  },
  {
    icon: 'md-clock',
    title: '历史会话',
    path: '/history',
    component: History,
  },
];
export default menu;
