import { Navigate, useParams } from 'react-router-dom'

export function RoomRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/rooms/${slug}/setting`} replace />;
}
