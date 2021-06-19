type FeedItem = Motion | Post;
type BackendFeedItem = BackendMotion | BackendPost;

interface Breadcrumb {
  label: string;
  href?: string;
}
