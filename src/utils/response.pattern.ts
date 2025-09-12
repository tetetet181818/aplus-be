export default function response({
  message,
  data,
  statusCode,
}: {
  message: string;
  data?: [] | null;
  statusCode: string;
}) {
  return {
    message,
    data,
    statusCode,
  };
}
