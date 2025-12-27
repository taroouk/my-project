import { Navigate, useParams } from "react-router-dom";

export default function DynamicStore() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/s/${slug || ""}`} replace />;
}
