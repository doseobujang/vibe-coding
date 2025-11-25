// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  LinearProgress,
} from "@mui/material";
import "./GrowNumber.css";

const BOARD_SIZE = 5; // 5x5 보드
const BAR_DURATION_MS = 10000;
const TIMER_TICK_MS = 100;

function getRandomIntInclusive(min, max) {
  const mn = Math.ceil(min);
  const mx = Math.floor(max);
  return Math.floor(Math.random() * (mx - mn + 1)) + mn;
}

export default function App() {
  // board: 길이 25짜리 배열, 각 칸은 null 또는 숫자 (1,2,3,...)
  const [board, setBoard] = useState(
    () => Array(BOARD_SIZE * BOARD_SIZE).fill(null)
  );
  const [tick, setTick] = useState(0); // 단순히 다시 렌더링 유도용 (디버깅/표시용)
  const [progress, setProgress] = useState(0); // 0~100 진행도

  // 새 숫자 생성 로직
  const spawnNewTile = useCallback(() => {
    setBoard((prev) => {
      const emptyIndices = prev
        .map((v, i) => (v === null ? i : null))
        .filter((v) => v !== null);

      if (emptyIndices.length === 0) {
        // 더 이상 빈 칸 없음
        return prev;
      }

      const hasThreeOrMore = prev.some((v) => v !== null && v >= 3);

      const value = hasThreeOrMore
        ? getRandomIntInclusive(1, 3)
        : 1; // 3 이상 숫자가 없으면 무조건 1

      const randomIndex =
        emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

      const newBoard = [...prev];
      newBoard[randomIndex] = value;
      return newBoard;
    });

    setTick((t) => t + 1);
    setProgress(0);
  }, []);

  // 처음 시작할 때 한 번 생성
  useEffect(() => {
    spawnNewTile();
  }, [spawnNewTile]);

  // 진행 바 애니메이션: 바가 꽉 차면 숫자 생성
  useEffect(() => {
    const intervalId = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (TIMER_TICK_MS / BAR_DURATION_MS) * 100;
        return next >= 100 ? 100 : next;
      });
    }, TIMER_TICK_MS);

    return () => clearInterval(intervalId);
  }, [spawnNewTile]);

  // 바가 가득 찼을 때만 숫자 생성
  useEffect(() => {
    if (progress >= 100) {
      spawnNewTile();
    }
  }, [progress, spawnNewTile]);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData("text/plain");
    if (!sourceIndexStr) return;

    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (Number.isNaN(sourceIndex)) return;
    if (sourceIndex === targetIndex) return;

    setBoard((prev) => {
      const sourceValue = prev[sourceIndex];
      const targetValue = prev[targetIndex];

      if (sourceValue === null) return prev; // 빈 칸에서 드래그했으면 무시

      // 빈 칸으로 이동 (숫자 변화 없음)
      if (targetValue === null) {
        const newBoard = [...prev];
        newBoard[targetIndex] = sourceValue;
        newBoard[sourceIndex] = null;
        return newBoard;
      }

      // 같은 숫자일 때만 합체
      if (sourceValue !== targetValue) return prev; // 다른 숫자면 무시

      const newBoard = [...prev];
      newBoard[targetIndex] = targetValue + 1; // 숫자 +1
      newBoard[sourceIndex] = null; // 원래 칸 비우기
      return newBoard;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // drop 허용
  };

  const handleReset = () => {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setTick(0);
    setProgress(0);
  };

  // 최대 숫자 (UI용)
  const maxValue = board.reduce(
    (max, v) => (v !== null && v > max ? v : max),
    0
  );

  const elapsedMs = Math.max(0, BAR_DURATION_MS * (progress / 100));
  const elapsedSeconds = (elapsedMs / 1000).toFixed(1);
  const totalSeconds = (BAR_DURATION_MS / 1000).toFixed(1);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom> 
          숫자 키우기 게임
        </Typography>
        <Typography variant="body1" align="center">
          10초마다 새 숫자가 등장해.
          <br />
          같은 숫자를 마우스로 끌어서 겹치면 숫자가 1 증가하고 크기도 조금 커져!
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <Typography variant="body2">자동 생성: 10초마다 생성</Typography>
          <Button variant="outlined" size="small" onClick={spawnNewTile}>
            새 숫자 생성
          </Button>
          <Button variant="text" size="small" onClick={handleReset}>
            리셋
          </Button>
        </Stack>

        <Typography variant="body2" className="gn-text-white">
          생성 횟수: {tick} | 최대 숫자: {maxValue || "-"}
        </Typography>

        <Box sx={{ width: "100%" }}>
          <Stack spacing={0.5}>
            <Typography variant="caption" className="gn-text-white">
              다음 자동 생성까지 진행도
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Typography variant="caption" className="gn-text-white">
                {elapsedSeconds}s / {totalSeconds}s
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Stack>
        </Box>

        {/* 보드 */}
        <Box
          sx={{
            mt: 2,
            width: "100%",
            aspectRatio: "1 / 1",
            maxWidth: 400,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
              gap: 1.5,
              width: "100%",
              height: "100%",
            }}
          >
            {board.map((value, index) => {
              return (
                <Box
                  key={index}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid transparent",
                    backgroundColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {value !== null && (
                    <Paper
                      elevation={4}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      sx={{
                        width: "70%",
                        height: "70%",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "grab",
                        userSelect: "none",
                        // 숫자에 따라 살짝씩 커지는 효과
                        transform: `scale(${1 + value * 0.08})`,
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "bold",
                        }}
                      >
                        {value}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
