import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "../shared/config/supabase";
import { LoadingSpinner } from "@/shared/components";

export const Route = createFileRoute("/contact")({
  component: Contact,
});

type EmailSendingStatus = 'idle' | 'sending' | 'success' | 'error';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  privacyConsent: boolean;
}

export function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    privacyConsent: false,
  });

  const [sendingStatus, setSendingStatus] = useState<EmailSendingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검증
    if (!formData.privacyConsent) {
      setErrorMessage('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setErrorMessage('모든 필수 항목을 입력해주세요.');
      return;
    }

    setSendingStatus('sending');
    setErrorMessage('');

    try {
      const { error } = await supabase.functions.invoke('contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }
      });

      if (error) {
        throw error;
      }

      setSendingStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        privacyConsent: false,
      });

      // 3초 후 성공 상태 초기화
      setTimeout(() => {
        setSendingStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('이메일 전송 실패:', error);
      setSendingStatus('error');

      // 에러 유형에 따른 구체적인 메시지 설정
      if (error instanceof Error) {
        setErrorMessage(error.message.includes('network') ?
          '네트워크 연결을 확인해주세요.' :
          '메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setErrorMessage('예기치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">연락처</h1>
          <p className="text-gray-600">
            궁금한 점이 있거나 함께 일하고 싶으시다면 언제든 연락주세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-6">연락 방법</h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg">
                  📧
                </div>
                <div>
                  <h3 className="font-semibold mb-1">이메일</h3>
                  <p className="text-gray-600">chanho.kim@example.com</p>
                  <p className="text-sm text-gray-500">
                    업무 관련 문의나 협업 제안
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 text-gray-600 rounded-lg">
                  🐙
                </div>
                <div>
                  <h3 className="font-semibold mb-1">GitHub</h3>
                  <p className="text-gray-600">
                    <a
                      href="https://github.com/chan-ok"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      github.com/chan-ok
                    </a>
                  </p>
                  <p className="text-sm text-gray-500">
                    오픈소스 프로젝트와 코드 저장소
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg">
                  💼
                </div>
                <div>
                  <h3 className="font-semibold mb-1">LinkedIn</h3>
                  <p className="text-gray-600">
                    <a
                      href="https://linkedin.com/in/username"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      linkedin.com/in/username
                    </a>
                  </p>
                  <p className="text-sm text-gray-500">
                    전문적인 네트워킹과 경력 정보
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">응답 시간</h3>
              <p className="text-gray-600 text-sm">
                일반적으로 24-48시간 내에 답변드립니다.
                급한 업무의 경우 제목에 [긴급]을 표기해 주세요.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">메시지 보내기</h2>

            {sendingStatus === 'sending' && (
              <div className="mb-6">
                <LoadingSpinner text="메시지를 전송하고 있습니다..." />
              </div>
            )}

            <form className="space-y-6" onSubmit={handleFormSubmit}>
              {sendingStatus === 'success' && (
                <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                  ✅ 메시지가 성공적으로 전송되었습니다! 24-48시간 내에 답변드리겠습니다.
                </div>
              )}

              {(sendingStatus === 'error' || errorMessage) && (
                <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                  ❌ {errorMessage}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={sendingStatus === 'sending'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={sendingStatus === 'sending'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  disabled={sendingStatus === 'sending'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="문의 제목을 입력해주세요"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  내용 *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  disabled={sendingStatus === 'sending'}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                  placeholder="궁금한 점이나 전하고 싶은 말씀을 자유롭게 작성해주세요."
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="privacyConsent"
                  name="privacyConsent"
                  checked={formData.privacyConsent}
                  onChange={handleInputChange}
                  disabled={sendingStatus === 'sending'}
                  className="mt-1 disabled:cursor-not-allowed"
                  required
                />
                <label htmlFor="privacyConsent" className="text-sm text-gray-600">
                  개인정보 수집 및 이용에 동의합니다.
                  (입력하신 정보는 문의 답변 목적으로만 사용됩니다)
                </label>
              </div>

              <button
                type="submit"
                disabled={sendingStatus === 'sending' || !formData.privacyConsent}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {sendingStatus === 'sending' ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>전송 중...</span>
                  </>
                ) : (
                  '메시지 보내기'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
