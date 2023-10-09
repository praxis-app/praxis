import { RouteObject } from 'react-router-dom';
import EditPost from '../pages/Posts/EditPost/EditPost';
import PostPage from '../pages/Posts/PostPage/PostPage';

const postsRouter: RouteObject = {
  path: '/posts',
  children: [
    {
      path: ':id',
      element: <PostPage />,
    },
    {
      path: ':id/edit',
      element: <EditPost />,
    },
  ],
};

export default postsRouter;
