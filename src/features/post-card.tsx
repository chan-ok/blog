interface PostCardProps {
  title: string;
  summary: string;
}

export default function PostCard({ title, summary }: PostCardProps) {
  return (
    <article className="mb-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      <p className="mb-3 text-gray-700">{summary}</p>
      <a href="#" className="text-blue-600 hover:underline">
        더 읽기 →
      </a>
    </article>
  );
}
