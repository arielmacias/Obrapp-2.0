const formatDateToSql = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeDateInput = (value) => {
  if (!value) {
    return new Date();
  }
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
};

const getWeekRange = (date) => {
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = base.getDay();
  const diff = (day + 6) % 7;
  const start = new Date(base);
  start.setDate(base.getDate() - diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start,
    end,
    startSql: formatDateToSql(start),
    endSql: formatDateToSql(end)
  };
};

module.exports = { formatDateToSql, normalizeDateInput, getWeekRange };
