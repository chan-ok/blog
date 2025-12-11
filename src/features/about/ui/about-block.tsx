import Image from 'next/image';
import { Github, Mail } from 'lucide-react';

export default function AboutBlock() {
  return (
    <div className="w-full flex items-center justify-around gap-8">
      <div>
        <Image
          src="/image/git-profile.png"
          alt="Profile"
          width={120}
          height={120}
          className="rounded-full"
        />
      </div>
      <div className="text-left sm:text-center">
        <h2 className="mb-2 text-2xl font-bold">Hi, There! 👋</h2>
        <p className="text-gray-600 dark:text-gray-300">
          사용자 경험에 집중하는 프론트엔드 개발자입니다.
          <br />
          직관적인 코드와 명확한 구조를 지향합니다.
        </p>
        <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <a
            href="mailto:kiss.yagni.dry@gmail.com"
            className="flex items-center hover:text-gray-700 dark:hover:text-gray-200"
          >
            <Mail size={16} />
          </a>
          <a
            href="https://github.com/chan-ok"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 dark:hover:text-gray-200"
          >
            <Github size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
