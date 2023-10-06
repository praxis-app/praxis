import { Observable } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import {
  MutationNames,
  UNAUTHORIZED,
} from '../../../constants/shared.constants';
import { formatGQLError } from '../../../utils/error.utils';
import {
  isAuthLoadingVar,
  isLoggedInVar,
  isRefreshingTokenVar,
} from '../../cache';
import client from '../../client';
import { LogOutDocument } from '../generated/LogOut.mutation';
import { RefreshTokenDocument } from '../generated/RefreshToken.mutation';

type Callback = (arg: unknown) => void;

let tokenSubscribers: Callback[] = [];

const subscribeTokenRefresh = (cb: Callback) => {
  tokenSubscribers.push(cb);
};
const onTokenRefreshed = (err: unknown) => {
  tokenSubscribers.map((cb: Callback) => cb(err));
};
const prepareExit = () => {
  onTokenRefreshed(null);
  tokenSubscribers = [];
};

const refreshToken = async () => {
  try {
    isRefreshingTokenVar(true);
    await client.mutate({ mutation: RefreshTokenDocument });
  } catch (err) {
    await client.mutate({ mutation: LogOutDocument });
    isAuthLoadingVar(false);
    isLoggedInVar(false);
    throw err;
  } finally {
    isRefreshingTokenVar(false);
  }
};

const refreshTokenLink = onError(
  ({ graphQLErrors, networkError, operation, response, forward }) =>
    new Observable((observer) => {
      if (graphQLErrors) {
        graphQLErrors.map(async ({ message, locations, path }, index) => {
          // TODO: Include extensions.stacktrace in error output
          console.error(formatGQLError(message, path, locations));

          if (!response) {
            return observer.error(graphQLErrors[index]);
          }

          if (message === UNAUTHORIZED) {
            if (operation.operationName === MutationNames.RefreshToken) {
              return observer.error(graphQLErrors[index]);
            }

            const retryRequest = () => {
              const subscriber = {
                complete: observer.complete.bind(observer),
                error: observer.error.bind(observer),
                next: observer.next.bind(observer),
              };
              return forward(operation).subscribe(subscriber);
            };

            if (!isRefreshingTokenVar()) {
              try {
                await refreshToken();
                prepareExit();
                return retryRequest();
              } catch {
                prepareExit();
                return observer.error(graphQLErrors[index]);
              }
            }

            const tokenSubscriber = new Promise((resolve) => {
              subscribeTokenRefresh((errRefreshing: unknown) => {
                if (!errRefreshing) {
                  return resolve(retryRequest());
                }
              });
            });
            return tokenSubscriber;
          }
          return observer.next(response);
        });
      }

      if (networkError) {
        console.error(`[Network error]: ${networkError}`);
        return observer.error(networkError);
      }
    }),
);

export default refreshTokenLink;
