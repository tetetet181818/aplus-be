export default function response({
  message,
  data,
  statusCode,
  token,
}: {
  message: string;
  data?: [] | null | object | string | boolean;
  statusCode: number;
  token?: string;
}) {
  return {
    message,
    statusCode,
    data,
    token,
  };
}
