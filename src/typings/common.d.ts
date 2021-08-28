type FeedItem = Motion | Post;
type BackendFeedItem = BackendMotion | BackendPost;

interface FeedState {
  items: FeedItem[];
  totalItems: number;
  loading: boolean;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
}

interface Breadcrumb {
  label: string;
  href?: string;
}

type ToastStatus = "success" | "info" | "warning" | "error";
interface ToastNotification {
  title: string;
  status: ToastStatus;
}

type ScrollDirection = "" | ScrollDirections.Up | ScrollDirections.Down;
