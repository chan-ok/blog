// 배열에서 중복 제거
export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// 배열을 청크로 나누기
export function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

// 배열 셔플 (피셔-예이츠 알고리즘)
export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

// 배열에서 랜덤 요소 선택
export function getRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;

  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

// 배열에서 여러 랜덤 요소 선택
export function getRandomElements<T>(array: T[], count: number): T[] {
  if (count >= array.length) return shuffleArray(array);

  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
}

// 배열을 키로 그룹화
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

// 배열에서 빈 값 제거
export function removeEmpty<T>(array: (T | null | undefined)[]): T[] {
  return array.filter((item): item is T => item != null);
}

// 배열 합집합
export function union<T>(array1: T[], array2: T[]): T[] {
  return removeDuplicates([...array1, ...array2]);
}

// 배열 교집합
export function intersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => array2.includes(item));
}

// 배열 차집합
export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => !array2.includes(item));
}

// 배열에서 최대값 찾기
export function findMax<T>(array: T[], valueFn: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;

  return array.reduce((max, current) =>
    valueFn(current) > valueFn(max) ? current : max
  );
}

// 배열에서 최소값 찾기
export function findMin<T>(array: T[], valueFn: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;

  return array.reduce((min, current) =>
    valueFn(current) < valueFn(min) ? current : min
  );
}

// 배열 정렬 (한국어 지원)
export function sortKorean<T>(array: T[], keyFn: (item: T) => string, reverse: boolean = false): T[] {
  const copy = [...array];

  return copy.sort((a, b) => {
    const compareResult = keyFn(a).localeCompare(keyFn(b), 'ko');
    return reverse ? -compareResult : compareResult;
  });
}

// 배열에서 마지막 N개 요소 가져오기
export function takeRight<T>(array: T[], count: number): T[] {
  return array.slice(-count);
}

// 배열에서 첫 N개 요소 가져오기
export function take<T>(array: T[], count: number): T[] {
  return array.slice(0, count);
}

// 배열 평탄화 (중첩 배열을 1차원으로)
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.flat() as T[];
}

// 배열 요소 개수 세기
export function countElements<T>(array: T[]): Record<string, number> {
  return array.reduce((counts, item) => {
    const key = String(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}