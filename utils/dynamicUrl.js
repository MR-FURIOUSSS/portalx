export async function calendarDynamicUrl() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  let academicYearString;
  let semesterType;

  if (currentMonth >= 1 && currentMonth <= 6) {
    semesterType = "EVEN";
    academicYearString = `${currentYear - 1}_${currentYear
      .toString()
      .slice(-2)}`;
  } else {
    semesterType = "ODD";
    academicYearString = `${currentYear}_${(currentYear + 1)
      .toString()
      .slice(-2)}`;
  }

  const baseUrl =
    "https://academia.srmist.edu.in/srm_university/academia-academic-services/page/Academic_Planner_";
  const dynamicUrl = `${baseUrl}${academicYearString}_${semesterType}`;
  return dynamicUrl;
}

export async function courseDynamicUrl() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  let academicYearString;

  if (currentMonth >= 1 && currentMonth <= 6) {
    academicYearString = `${currentYear - 2}_${(currentYear - 1)
      .toString()
      .slice(-2)}`;
  } else {
    academicYearString = `${currentYear - 1}_${currentYear
      .toString()
      .slice(-2)}`;
  }

  const baseUrl =
    "https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Time_Table_";
  const dynamicUrl = `${baseUrl}${academicYearString}`;
  return dynamicUrl;
}
