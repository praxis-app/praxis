type FeedItem = Motion | Post;
type BackendFeedItem = BackendMotion | BackendPost;

interface Breadcrumb {
  label: string;
  href?: string;
}

type ToastStatus = "success" | "info" | "warning" | "error";
interface ToastNotification {
  title: string;
  status: ToastStatus;
}
