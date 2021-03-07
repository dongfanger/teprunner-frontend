export const pwdReg = /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{8,30}$/;
export const pwdRegText = "密码支持数字、字母、特殊字符，两种及以上类型组合，长度限制8-30之间";

export const blankSpaceReg = /\s+/;

export const chineseReg = /[\u4e00-\u9fa5]+/;

export const specialCodeReg = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>/?~！@#￥……&*（）——|{}【】‘；：”“’。，、？]+");
export const nameValidator = (rule, value, callback) => {
  if (value) {
    value = value.trim();
    if (value.length < 2 || value.length > 30) {
      callback("名称长度限制在2~30之间");
    } else if (specialCodeReg.test(value)) {
      callback("名称不能包含特殊字符");
    }
  }
  callback();
};

export const pwdValidator = (rule, value, callback) => {
  if (value) {
    if (value.length < 8 || value.length > 30) {
      callback("密码长度限制8~30之间");
    } else if (!pwdReg.test(value)) {
      callback("你的密码复杂度太低, 请重新输入");
    }
  }
  callback();
};
