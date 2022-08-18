import sentryPlugin from "@cloudflare/pages-plugin-sentry";

export const onRequest: PagesFunction<{
  SENTRY_DSN: string;
}> = (context) => {
  return sentryPlugin({ dsn: context.env.SENTRY_DSN })(context);
};
