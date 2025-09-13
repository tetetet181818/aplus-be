export default function response({
  message,
  data,
  statusCode,
  token,
}: {
  message: string;
  data?: [] | null | object | string;
  statusCode: number;
  token?: string;
}) {
  return {
    message,
    data,
    statusCode,
    token,
  };
}
