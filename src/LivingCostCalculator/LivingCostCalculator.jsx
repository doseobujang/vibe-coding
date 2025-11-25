import React, { useMemo, useState } from 'react';
import {
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import './LivingCostCalculator.css';

const MONTH_MARKS = [
  { value: 6, label: '6' },
  { value: 12, label: '12' },
  { value: 24, label: '24' },
  { value: 36, label: '36' },
  { value: 48, label: '48' },
];

const numberParser = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const currency = (value) =>
  value.toLocaleString('ko-KR', {
    maximumFractionDigits: 0,
  });

function LabeledNumberField({ label, value, onChange, adornment }) {
  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      type="number"
      inputProps={{ min: 0, step: 1 }}
      value={value}
      onChange={(e) => onChange(numberParser(e.target.value))}
      InputProps={{
        endAdornment: adornment ? (
          <Typography
            variant="caption"
            color="text.secondary"
            className="lcc-adornment"
          >
            {adornment}
          </Typography>
        ) : null,
      }}
    />
  );
}

export default function LivingCostCalculator() {
  const [months, setMonths] = useState(12);
  const [inputs, setInputs] = useState({
    deposit: 500, // 만원 단위
    monthlyRent: 55,
    maintenance: 8,
    utilities: 6,
    groceries: 35,
    transport: 6,
    internet: 3,
    other: 5,
    setup: 40,
  });
  const [monthlyIncome, setMonthlyIncome] = useState(40);

  const handleChange = (key) => (value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const {
    deposit,
    monthlyRent,
    maintenance,
    utilities,
    groceries,
    transport,
    internet,
    other,
    setup,
  } = inputs;

  const { monthlyBase, amortizedMonthly, totalSpent } =
    useMemo(() => {
      const base =
        monthlyRent +
        maintenance +
        utilities +
        groceries +
        transport +
        internet +
        other;
      const amortized = setup / Math.max(1, months);
      const effective = base + amortized;
      const total = base * months + setup; // 보증금은 반환된다고 가정
      return {
        monthlyBase: base,
        amortizedMonthly: amortized,
        totalSpent: total,
      };
    }, [
      deposit,
      internet,
      maintenance,
      groceries,
      monthlyRent,
      months,
      other,
      setup,
      transport,
      utilities,
    ]);

  const initialCashNeed = deposit + setup + monthlyBase;
  const incomeTotal = monthlyIncome * months;
  const totalAfterIncome = totalSpent - incomeTotal;
  const monthlyDelta = monthlyIncome - (monthlyBase + amortizedMonthly);

  const handleMonthChange = (_event, val) => {
    const next = Array.isArray(val) ? val[0] : val;
    setMonths(Math.round(next));
  };

  const handleMonthLabelClick = (event) => {
    const parsed = Number(event.target.innerText);
    if (Number.isNaN(parsed)) return;
    event.stopPropagation();
    setMonths(parsed);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={8}
        className="lcc-wrapper"
        sx={{
          p: 3,
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
          backdropFilter: 'blur(6px)',
        }}
      >
        <Stack spacing={1} alignItems="flex-start">
          <Typography variant="h4" fontWeight={700}>
            자취 비용 계산기
          </Typography>
          <Typography variant="body2" color="text.secondary">
            월별 고정비와 예상 거주 기간을 넣으면 실지출과 초기 자금 필요량을
            바로 계산해 줘요. 단위는 모두 만원입니다.
          </Typography>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                주거/생활 고정비 (월)
              </Typography>
              <LabeledNumberField
                label="월세"
                value={monthlyRent}
                onChange={handleChange('monthlyRent')}
                adornment="만원"
              />
              <LabeledNumberField
                label="관리비"
                value={maintenance}
                onChange={handleChange('maintenance')}
                adornment="만원"
              />
              <LabeledNumberField
                label="공과금 (전기/가스/수도)"
                value={utilities}
                onChange={handleChange('utilities')}
                adornment="만원"
              />
              <LabeledNumberField
                label="식비"
                value={groceries}
                onChange={handleChange('groceries')}
                adornment="만원"
              />
              <LabeledNumberField
                label="교통비"
                value={transport}
                onChange={handleChange('transport')}
                adornment="만원"
              />
              <LabeledNumberField
                label="인터넷/통신"
                value={internet}
                onChange={handleChange('internet')}
                adornment="만원"
              />
              <LabeledNumberField
                label="기타"
                value={other}
                onChange={handleChange('other')}
                adornment="만원"
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                보증금 및 준비 비용
              </Typography>
              <LabeledNumberField
                label="보증금"
                value={deposit}
                onChange={handleChange('deposit')}
                adornment="만원"
              />
              <LabeledNumberField
                label="초기 세팅 비용 (가구/가전/이사)"
                value={setup}
                onChange={handleChange('setup')}
                adornment="만원"
              />

              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2">
                    거주 예정 기간
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {months}개월
                  </Typography>
                </Stack>
                <Slider
                  value={months}
                  min={1}
                  max={48}
                  step={1}
                  onChange={handleMonthChange}
                  marks={MONTH_MARKS}
                  slotProps={{
                    markLabel: {
                      onClick: handleMonthLabelClick,
                    },
                  }}
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              className="lcc-card-white"
              sx={{
                p: 2,
                borderRadius: 2,
                height: '100%',
              }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  월간 요약
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">월 생활비</Typography>
                  <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                    {currency(monthlyBase)} 만원
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">
                    초기비용 월할
                  </Typography>
                  <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                    {currency(amortizedMonthly)} 만원
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              className="lcc-card-white"
              sx={{
                p: 2,
                borderRadius: 2,
                height: '100%',
              }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  총액 요약 ({months}개월)
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">
                    총 실지출 (보증금 제외)
                  </Typography>
                  <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                    {currency(totalSpent)} 만원
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">
                    필요 초기 현금
                  </Typography>
                  <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                    {currency(initialCashNeed)} 만원
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">
                    묶이는 보증금
                  </Typography>
                  <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                    {currency(deposit)} 만원
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              className="lcc-card-white"
              sx={{
                p: 2,
                borderRadius: 2,
                height: '100%',
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={600}>
                  수익 기반 계산
                </Typography>
                <TextField
                  size="small"
                  label="월 수익"
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(numberParser(e.target.value))}
                  className="lcc-income-field"
                  InputProps={{
                    endAdornment: (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="lcc-income-adornment"
                      >
                        만원
                      </Typography>
                    ),
                  }}
                />

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">
                    월 잔여/부족
                  </Typography>
                  <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                    {currency(Math.abs(Math.round(monthlyDelta)))} 만원 {monthlyDelta >= 0 ? '잉여' : '부족'}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">
                    기간 총 잔여/부족
                  </Typography>
                  <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                    {currency(Math.abs(Math.round(totalAfterIncome)))} 만원 {totalAfterIncome <= 0 ? '잉여' : '부족'}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  총 실지출(보증금 제외)에서 월 수익 * 거주기간을 뺀 값으로 계산했어요.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            보증금은 전액 반환된다고 가정했어요. 전세자금대출 이자나 계약
            중개수수료가 있다면 기타 항목에 포함하거나 별도 계산해 주세요.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
