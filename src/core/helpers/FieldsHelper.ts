import { format } from 'date-fns'

export const formatDate = (dt) => {
  return format(new Date(dt), 'dd-MM-yyyy');
};

export const formatDateTime = (dt) => {
  return format(new Date(dt), 'dd-MM-yyyy HH:mm:ss.aaa');
};

export const formatTime = (dt) => {
  return format(new Date(dt), 'HH:mm:ss.aaa');
};

export const formatNumberCommas = (value) => {
  if (value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return value;
  }
};