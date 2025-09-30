# React Voice Recorder Pro - 사용 예시

이 폴더에는 `react-voice-recorder-pro` 라이브러리의 다양한 사용 예시가 포함되어 있습니다.

## 예시 목록

### 1. Basic Usage (`basic-usage.tsx`)
가장 기본적인 음성 녹음 기능을 보여주는 예시입니다.

**주요 기능:**
- 마이크 활성화/비활성화
- 녹음 시작/정지/일시정지/재개
- 실시간 오디오 레벨 표시
- 녹음된 오디오 재생
- 기본적인 에러 처리

**사용법:**
```tsx
import { BasicVoiceRecorder } from './examples/basic-usage';

function App() {
  return <BasicVoiceRecorder />;
}
```

### 2. Advanced Usage (`advanced-usage.tsx`)
고급 기능들을 활용한 음성 녹음 예시입니다.

**주요 기능:**
- 다양한 오디오 포맷 선택 (WebM, MP4, WAV, OGG)
- 최대 녹음 시간 설정
- 디바이스 정보 표시
- 녹음 히스토리 관리
- 파일 다운로드 기능
- 고급 오디오 레벨 시각화

**사용법:**
```tsx
import { AdvancedVoiceRecorder } from './examples/advanced-usage';

function App() {
  return <AdvancedVoiceRecorder />;
}
```

### 3. Voice Memo App (`voice-memo-app.tsx`)
실제 앱에서 사용할 수 있는 완전한 음성 메모 애플리케이션 예시입니다.

**주요 기능:**
- 음성 메모 생성 및 관리
- 메모 제목 편집
- 메모 재생/정지
- 메모 다운로드
- 메모 삭제
- 로컬 스토리지 연동 (기본 구조)
- 반응형 UI

**사용법:**
```tsx
import { VoiceMemoApp } from './examples/voice-memo-app';

function App() {
  return <VoiceMemoApp />;
}
```

## 각 예시의 특징

### Basic Usage
- **난이도**: 초급
- **용도**: 라이브러리 기본 기능 학습
- **추천 대상**: 처음 사용하는 개발자

### Advanced Usage
- **난이도**: 중급
- **용도**: 고급 기능 활용 및 커스터마이징
- **추천 대상**: 다양한 옵션을 활용하고 싶은 개발자

### Voice Memo App
- **난이도**: 고급
- **용도**: 실제 프로덕션 앱 개발 참고
- **추천 대상**: 완전한 앱을 만들고 싶은 개발자

## 실행 방법

각 예시를 실행하려면:

1. 라이브러리를 설치합니다:
```bash
npm install react-voice-recorder-pro
```

2. 원하는 예시 컴포넌트를 import하여 사용합니다:
```tsx
import React from 'react';
import { BasicVoiceRecorder } from 'react-voice-recorder-pro/examples/basic-usage';

function App() {
  return (
    <div>
      <h1>My Voice Recording App</h1>
      <BasicVoiceRecorder />
    </div>
  );
}

export default App;
```

## 브라우저 지원

모든 예시는 다음 브라우저에서 테스트되었습니다:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 모바일 지원

모든 예시는 모바일 브라우저에서도 작동합니다:
- iOS Safari
- Android Chrome
- Samsung Internet

## 주의사항

1. **HTTPS 필수**: 프로덕션 환경에서는 HTTPS가 필요합니다.
2. **마이크 권한**: 사용자가 마이크 권한을 허용해야 합니다.
3. **iOS Safari**: 사용자 제스처 후에 오디오 컨텍스트가 활성화됩니다.

## 문제 해결

### 마이크가 작동하지 않는 경우
1. 브라우저에서 마이크 권한을 확인하세요.
2. HTTPS를 사용하고 있는지 확인하세요.
3. 다른 앱이 마이크를 사용하고 있지 않은지 확인하세요.

### iOS Safari에서 문제가 있는 경우
1. 사용자 제스처(버튼 클릭 등) 후에 녹음을 시작하세요.
2. `resumeAudioContext()` 함수를 사용하여 오디오 컨텍스트를 활성화하세요.

### 녹음이 저장되지 않는 경우
1. 브라우저가 MediaRecorder API를 지원하는지 확인하세요.
2. 선택한 오디오 포맷이 브라우저에서 지원되는지 확인하세요.

## 추가 리소스

- [라이브러리 문서](../README.md)
- [API 레퍼런스](../docs/api.md)
- [문제 신고](https://github.com/yourusername/react-voice-recorder-pro/issues)
