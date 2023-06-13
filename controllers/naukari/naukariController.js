const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { sendMailTemplate } = require("../../utils/emailTamplate");
const { dateConvert } = require("../../utils/dateConvert");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const root = path.dirname(require.main.filename);

async function ApiCall(pageNO) {
  let axiosResponse;
  const headers = {
    headers: {
      Appid: 109,
      Systemid: 110,
      Connection: "keep-alive",
      "Cache-Control": "max-age=0",
      "sec-ch-ua":
        '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "macOS",
      "Upgrade-Insecure-Requests": 1,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.83 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Dest": "document",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    },
  };
  try {
    axiosResponse = await axios.get(
      `https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_keyword&searchType=adv&keyword=salesforce&sort=f&pageNo=${pageNO}&experience=3&wfhType=2&wfhType=3&jobPostType=2&k=salesforce&nignbevent_src=jobsearchDeskGNB&experience=3&wfhType=2&wfhType=3&jobPostType=2&seoKey=salesforce-jobs&src=sortby&latLong=26.2271003_78.2134235&sid=16865704667235866`,
      headers
    );
  } catch (error) {
    console.log(error.message);
  }

  return axiosResponse;
}

module.exports = async function nuakariController(
  flag = true,
  axiosResponse = [],
  pageNO = 1,
  arr = []
) {
  try {
    axiosResponse = flag === true ? await ApiCall(pageNO) : axiosResponse;

    let timestamp = dateConvert();

    for (const [index, value] of axiosResponse.data.jobDetails.entries()) {
      if (value.createdDate > timestamp) {
        arr.push(value);
        if (arr.length === pageNO * 20) {
          let page = pageNO++;
          axiosResponse = await ApiCall(pageNO);
          nuakariController(false, axiosResponse, page, arr);
        }
      } else {
        break;
      }
    }
  } catch (error) {
    console.log("error", error);
  }

  const csvWriter = createCsvWriter({
    path: "data.csv",
    header: [
      { id: "title", title: "Title" },
      { id: "tagsAndSkills", title: "TagsAndSkills" },
      { id: "companyName", title: "Company" },
      { id: "currency", title: "Currency" },
      { id: "jdURL", title: "JdURl" },
      { id: "jobDescription", title: "Jobdescription" },
    ],
  });

  //joins uploaded file path with root. replace filename with your input field name
  var absolutePath = path.join(root, "../data.csv");

  csvWriter.writeRecords(arr).then(() => {
    // sendMailTemplate(
    //   "ravi.ojha@360degreecloud.in",
    //   "Salesforce",
    //   "nuakari data Scraping",
    //   absolutePath
    // );
  });
};
