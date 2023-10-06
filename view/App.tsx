import { RouterProvider } from 'react-router-dom';
import appRouter from './routes/app.router';

const App = () => <RouterProvider router={appRouter} />;

export default App;
