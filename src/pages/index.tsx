import { createFileRoute, Link } from "@tanstack/react-router";
import { PostCard } from "@/shared/components";
import { getLatestPosts, getPopularTags } from "@/shared/data/sampleData";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const latestPosts = getLatestPosts(3);
  const popularTags = getPopularTags(4);

  return (
    <div className="py-8">
      <section className="mb-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            개발자 블로그
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            웹 개발 경험과 새로운 기술에 대한 학습 내용을 공유합니다.
            React, TypeScript, 그리고 모던 웹 개발에 관심이 많습니다.
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <Link
            to="/posts"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            모든 글 보기
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            소개 보기
          </Link>
        </div>
      </section>

      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">최신 글</h2>
          <Link
            to="/posts"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            전체 보기 →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">인기 주제</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTags.map((tag) => (
            <Link
              key={tag.name}
              to="/tags/$tagName"
              params={{ tagName: tag.name }}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <h3 className="font-semibold text-lg mb-1">{tag.name}</h3>
              <p className="text-gray-600 text-sm">{tag.postCount}개의 글</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">소식 받기</h2>
        <p className="text-gray-600 mb-6">
          새로운 글이 발행되면 이메일로 알림을 받아보세요.
        </p>
        <div className="max-w-md mx-auto flex space-x-2">
          <input
            type="email"
            placeholder="이메일 주소"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            구독
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          스팸은 보내지 않습니다. 언제든 구독을 취소할 수 있습니다.
        </p>
      </section>
    </div>
  );
}
