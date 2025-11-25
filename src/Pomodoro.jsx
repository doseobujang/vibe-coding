import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Slider,
  Stack,
  LinearProgress,
  Divider,
} from '@mui/material';
import { PlayArrow, Pause, RestartAlt } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ff6b6b' },
    secondary: { main: '#4dabf7' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
});

const MODES = {
  pomodoro: {
    key: 'pomodoro',
    label: 'Pomodoro',
    description: '집중 시간',
  },
  shortBreak: {
    key: 'shortBreak',
    label: 'Short Break',
    description: '짧은 휴식',
  },
  longBreak: {
    key: 'longBreak',
    label: 'Long Break',
    description: '긴 휴식',
  },
};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

function PomodoroApp() {
  const [activeMode, setActiveMode] = useState('pomodoro');
  const [durations, setDurations] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  }); // 단위: 분
  const [timeLeft, setTimeLeft] = useState(durations.pomodoro * 60); // 단위: 초
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // 모드 변경 시 / 길이 변경 시 (타이머가 멈춰 있을 때) 남은 시간 초기화
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(durations[activeMode] * 60);
    }
  }, [activeMode, durations, isRunning]);

  // 타이머 동작
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // 시간이 0초가 되었을 때 처리 (자동 모드 전환)
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);

      if (activeMode === 'pomodoro') {
        // Pomodoro 하나 끝
        setCompletedPomodoros((prev) => {
          const next = prev + 1;
          const isLongBreak = next % 4 === 0;
          const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
          setActiveMode(nextMode);
          return next;
        });
      } else {
        // 휴식 끝 -> 다시 Pomodoro
        setActiveMode('pomodoro');
      }
    }
  }, [timeLeft, isRunning, activeMode]);

  const handleModeChange = (_event, modeKey) => {
    if (!modeKey) return;
    setActiveMode(modeKey);
    setIsRunning(false);
  };

  const handleToggle = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durations[activeMode] * 60);
  };

  const handleDurationChange = (modeKey, newValue) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setDurations((prev) => {
      const updated = { ...prev, [modeKey]: value };
      return updated;
    });

    // 해당 모드 + 멈춰 있을 때만 남은 시간도 같이 갱신
    if (!isRunning && activeMode === modeKey) {
      setTimeLeft(value * 60);
    }
  };

  const totalSeconds = durations[activeMode] * 60;
  const progress =
    totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;

  const currentMode = MODES[activeMode];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper
          elevation={6}
          sx={{
            p: 3,
            borderRadius: 4,
            backdropFilter: 'blur(12px)',
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Pomodoro Timer
          </Typography>
          <Typography
            variant="subtitle2"
            align="center"
            color="text.secondary"
            gutterBottom
          >
            집중과 휴식을 주기적으로 반복해 보세요.
          </Typography>

          {/* 모드 탭 */}
          <Box sx={{ mt: 2 }}>
            <Tabs
              value={activeMode}
              onChange={handleModeChange}
              centered
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              {Object.values(MODES).map((mode) => (
                <Tab
                  key={mode.key}
                  value={mode.key}
                  label={mode.label}
                  sx={{ fontWeight: activeMode === mode.key ? 700 : 400 }}
                />
              ))}
            </Tabs>
          </Box>

          {/* 타이머 표시 */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
            >
              {currentMode.description}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.08em',
              }}
            >
              {formatTime(timeLeft)}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5 }}
              >
                남은 시간 기준 진행률
              </Typography>
            </Box>

            {/* 버튼 */}
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 3 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={isRunning ? <Pause /> : <PlayArrow />}
                onClick={handleToggle}
                sx={{ minWidth: 140 }}
              >
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestartAlt />}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 세션 길이 설정 */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              세션 길이 (분)
            </Typography>
            {Object.entries(MODES).map(([key, mode]) => (
              <Box key={key} sx={{ mb: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">
                    {mode.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {durations[key]} min
                  </Typography>
                </Stack>
                <Slider
                  value={durations[key]}
                  min={1}
                  max={60}
                  step={1}
                  onChange={(_e, v) =>
                    handleDurationChange(key, v)
                  }
                  disabled={isRunning} // 타이머 도는 중에는 변경 막기
                />
              </Box>
            ))}
            <Typography variant="caption" color="text.secondary">
              타이머가 멈춰 있을 때 길이를 바꿀 수 있어요.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 통계(오늘 완료한 뽀모도로 수) */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" color="text.secondary">
              완료한 Pomodoro 세션
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {completedPomodoros}
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default PomodoroApp;
