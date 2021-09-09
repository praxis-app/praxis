type ClientFeedItem = ClientMotion | ClientPost;

interface FeedState {
  items: ClientFeedItem[];
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
