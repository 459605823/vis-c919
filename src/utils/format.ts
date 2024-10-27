import {isNumber} from 'lodash-es';

export function formatNumber(value: number, notation: 'standard' | 'compact' = 'compact', toFixed = 2) {
  if (!isNumber(value))
    return '-';
  return new Intl.NumberFormat('zh-Hans-CN', {
    notation,
    useGrouping: true,
    maximumFractionDigits: toFixed,
  }).format(value);
}

export function formatAreaName(name: string) {
  return name
    .replace('省', '')
    .replace('自治区', '')
    .replace('特别行政区', '')
    .replace('市', '')
    .replace('维吾尔', '')
    .replace('壮族', '')
    .replace('回族', '')
    .replace('黔东南苗族侗族自治州', '黔东南洲')
    .replace('黔西南布依族苗族自治州', '黔西南洲')
    .replace('黔南布依族苗族自治州', '黔南洲')
    .replace('恩施土家族苗族自治州', '恩施')
    .replace('湘西土家族苗族自治州', '湘西州')
    .replace('延边朝鲜族自治州', '延边')
    .replace('文山苗族自治州', '文山')
    .replace('红河哈尼族州', '红河州')
    .replace('大理白族自治州', '大理州')
    .replace('伊犁哈萨克自治州', '伊犁州')
    .replace('克孜勒苏柯尔克孜自治州', '克孜勒苏州')
    .replace('昌吉自治州', '昌吉州')
    .replace('巴音郭楞州', '巴音郭楞')
    .replace('阿坝藏族羌族自治州', '阿坝州')
    .replace('海西蒙古族州', '海西州')
    .replace('甘南藏族自治州', '甘南州')
    .replace('临夏自治州', '临夏州')
    .replace('白沙黎族自治县', '白沙')
    .replace('保亭黎族苗族自治县', '保亭')
    .replace('昌江黎族自治县', '昌江')
    .replace('乐东黎族自治县', '乐东')
    .replace('陵水黎族自治县', '陵水')
    .replace('琼中黎族苗族自治县', '琼中')
    .replace('果洛藏族自治州', '果洛州')
    .replace('海北藏族自治州', '海北州')
    .replace('海南藏族自治州', '海南州')
    .replace('海西蒙古族藏族自治州', '海西州')
    .replace('黄南藏族自治州', '黄南州')
    .replace('玉树藏族自治州', '玉树州')
    .replace('甘孜藏族自治州', '甘孜州')
    .replace('凉山彝族自治州', '凉山州')
    .replace('巴音郭楞蒙古自治州', '巴音郭楞')
    .replace('博尔塔拉蒙古自治州', '博尔塔拉州')
    .replace('楚雄彝族自治州', '楚雄州')
    .replace('德宏傣族景颇族自治州', '德宏州')
    .replace('迪庆藏族自治州', '迪庆州')
    .replace('红河哈尼族彝族自治州', '红河州')
    .replace('怒江傈僳族自治州', '怒江州')
    .replace('西双版纳傣族自治州', '西双版纳');
}
