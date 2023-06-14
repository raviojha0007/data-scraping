const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { sendMailTemplate } = require("../../utils/emailTamplate");
const { dateConvert } = require("../../utils/dateConvert");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const root = path.dirname(require.main.filename);

async function ApiCall(pageNO) {
  //  // console.log(
  //     "APICALLL=>>>>>",
  //     `https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_keyword&searchType=adv&keyword=salesforce&sort=f&pageNo=${pageNO}&k=salesforce&seoKey=salesforce-jobs&src=sortby&latLong=26.2271003_78.2134235&sid=1686641506795660_2`
  //  // );
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
      `https://www.naukri.com/jobapi/v3/search?noOfResults=100&urlType=search_by_keyword&searchType=adv&keyword=salesforce&sort=f&pageNo=${pageNO}&k=salesforce&seoKey=salesforce-jobs&src=sortby&latLong=26.2271003_78.2134235&sid=1686641506795660_2`,
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
  csvWriter
) {
  try {
    let absolutePath = path.join(root, "../data.csv");
    let arr = [];
    axiosResponse = flag === true ? await ApiCall(pageNO) : axiosResponse;

    //console.log("axiosResponse.data===>", axiosResponse.data);
    const { noOfJobs, jobDetails } = axiosResponse.data;

    // TimeStapm Change

    function DateChnage(T) {
      let date =
        new Date(T).getDate() +
        "/" +
        (new Date(T).getMonth() + 1) +
        "/" +
        new Date(T).getFullYear();
      return date;
    }
    if (flag === true) {
      csvWriter = createCsvWriter({
        path: "data.csv",
        header: [
          { id: "title", title: "Title" },
          { id: "tagsAndSkills", title: "TagsAndSkills" },
          { id: "companyName", title: "Company" },
          { id: "currency", title: "Currency" },
          { id: "salary", title: "Salary" },
          { id: "location", title: "Location" },
          { id: "experience", title: "Experience" },
          { id: "jdURL", title: "JdURl" },
          { id: "jobDescription", title: "Jobdescription" },
          { id: "createdDate", title: "CreatedAt" },
        ],
      });
    }

    // let timestamp = dateConvert();

    for (const [index, value] of axiosResponse.data.jobDetails.entries()) {
      const obj = {
        title: value.title,
        tagsAndSkills: value.tagsAndSkills,
        currency: value.currency,
        experience: value.placeholders[0]?.label?value.placeholders[0]?.label:'',
        salary: value.placeholders[1]?.label?value.placeholders[1]?.label:'',
        companyName: value.companyName,
        location: value.placeholders[2]?.label?value.placeholders[2]?.label:'',
        jdURL: value.jdURL,
        jobDescription: value.jobDescription,
        createdDate: DateChnage(value.createdDate),
      };
      arr.push(obj);

      if (arr.length === axiosResponse.data.jobDetails.length) {
        csvWriter.writeRecords(arr).then(() => {});
        if (Number(noOfJobs) > pageNO * 100) {
          console.log("PageNo", pageNO);
          let page = pageNO + 1;
          await delay(1000 * 40);
          console.log("Page", page);
          axiosResponse = await ApiCall(page);
          await nuakariController(false, axiosResponse, page, csvWriter);
        }
      }
    }

    sendMailTemplate(
      "mayank.agarwal@360degreecloud.in",
      "Salesforce",
      "nuakari data Scraping",
      absolutePath
    );
  } catch (error) {
    console.log("error", error);
  }

  //joins uploaded file path with root. replace filename with your input field name
};

function delay(t) {
  return new Promise((resolve) => setTimeout(resolve, t));
}
