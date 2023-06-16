const LPA = require("linkedin-private-api");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
// const { sendMailTemplate } = require("../../utils/emailTamplate");
// const { dateConvert } = require("../../utils/dateConvert");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function ApiCall(start, onetime) {
  let axiosResponse;

  if (onetime) {
    console.log(onetime);
    axiosResponse = await axios.get(
      `https://www.linkedin.com/jobs/search?keywords=%22salesforce%22&location=India&locationId=&geoId=102713980&f_TPR=&f_JT=F%2CC&f_WT=1%2C3%2C2&f_E=3%2C4%2C5&position=1&pageNum=0`,
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "max-age=0",
          "sec-ch-ua":
            '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
  } else {
    axiosResponse = await axios.get(
      `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=%22salesforce%22&location=India&locationId=&geoId=102713980&f_TPR=&f_JT=F%2CC&f_WT=1%2C3%2C2&f_E=3%2C4%2C5&position=1&pageNum=0&start=${start}`,
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "csrf-token": "ajax:3992034033202227063",
          "sec-ch-ua":
            '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
        },
        referrer:
          "https://www.linkedin.com/jobs/search?keywords=%22salesforce%22&location=India&locationId=&geoId=102713980&f_TPR=&f_JT=F%2CC&f_WT=1%2C3%2C2&f_E=3%2C4%2C5&position=1&pageNum=0",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
  }

  return axiosResponse.data;
}

const root = path.dirname(require.main.filename);
exports.linkidInController = async function linkidInController(
  flag = true,
  axiosResponse,
  startNo = 0,
  csvWriter
) {
  try {
    let arr = [];
    axiosResponse =
      flag === true ? await ApiCall(startNo, true) : axiosResponse;

    const $ = cheerio.load(axiosResponse);
    const jobCount = $("title").text();
    const jobs = jobCount.substring(0, 5).replace(",", "");
    console.log(jobs);
    if (flag === true) {
      csvWriter = createCsvWriter({
        path: "LinkedIn.csv",
        header: [
          { id: "title", title: "Title" },
          { id: "companyName", title: "Company" },
          { id: "location", title: "Location" },
          { id: "createdAt", title: "CreatedAt" },
        ],
      });
    }

    $(".base-card").each(async (index, element) => {
      let obj = {};
      const title = $(element)
        .find(".base-card__full-link > span")
        .text()
        .trim();
      console.log("title=====>", title);
      const companyName = $(element)
        .find(".base-search-card__subtitle > .hidden-nested-link")
        .text()
        .trim();

      const location = $(element)
        .find(".base-search-card__metadata > .job-search-card__location")
        .text()
        .trim();

      const createdAt = $(element)
        .find(".base-search-card__metadata  .job-search-card__listdate")
        .attr("datetime");

      //console.log("inner loop", title, companyName, createdAt);
      obj = {
        title: title,
        companyName: companyName,
        location: location,
        createdAt: createdAt,
      };
      arr.push(obj);
      if (arr.length === 25) {
        csvWriter.writeRecords(arr).then(() => {});
        if (200 > startNo) {
          await delay(1000 * 30);
          let start = startNo + 25;
          console.log("start", start);
          axiosResponse = await ApiCall(start, false);
          await linkidInController(false, axiosResponse, start, csvWriter);
        }
      }
    });

    // fs.appendFile("index.html", res, "utf8", (err) => {
    //   if (err) {
    //     //console.error('Error writing JSON file:', err);
    //   } else {
    //     console.log("Data saved to scraped_data.json");
    //   }
    // });

    // const username = "360javascriptteam@gmail.com";
    // const password = process.env.PASSWORD;
    // const client = new LPA.Client();
    // await client.login.userPass({ username, password });

    // const jobsScroller = await client.search.searchJobs({
    //   keywords: "Salesforce",
    //   filters: { location: "India" },
    //   limit: 20,
    //   skip: 0,
    // });

    // const someReactJobHit = await jobsScroller.scrollNext();

    // for (const [index, value] of someReactJobHit.entries()) {
    //   arr.push({
    //     name: value.hitInfo.jobPosting.companyDetails.company.name,
    //     title: value.hitInfo.jobPosting.title,
    //   });
    //   console.log(JSON.stringify(someReactJobHit[0]))
    //   break;
    // }

    // const csvWriter = createCsvWriter({
    //   path: "LinkedIn.csv",
    //   header: [
    //     { id: "name", title: "CompanyName" },
    //     { id: "title", title: "Title" },
    //   ],
    // });

    //joins uploaded file path with root. replace filename with your input field name
    // var absolutePath = path.join(root, "../LinkedIn.csv");

    // csvWriter.writeRecords(arr).then(() => {
    // sendMailTemplate(
    //   "ravi.ojha@360degreecloud.in",
    //   "Salesforce",
    //   "nuakari data Scraping",
    //   absolutePath
    // );
    //});
    // const jobCompanyName =
    //   someReactJobHit.hitInfo.jobPosting.companyDetails.company.name;

    // const companiesScroller = await client.search.searchCompanies({
    //   keywords: jobCompanyName,
    // });
    // const [{ company: jobCompany }] = await companiesScroller.scrollNext();
  } catch (error) {
    console.log(error);
  }
};

function delay(t) {
  return new Promise((resolve) => setTimeout(resolve, t));
}
