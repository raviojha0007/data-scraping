const LPA = require("linkedin-private-api");
const path = require("path");
// const { sendMailTemplate } = require("../../utils/emailTamplate");
// const { dateConvert } = require("../../utils/dateConvert");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const root = path.dirname(require.main.filename);
exports.linkidInController = async function linkidInController() {
  let arr = [];
  try {
    const username = "360javascriptteam@gmail.com";
    const password = process.env.PASSWORD;
    const client = new LPA.Client();
    await client.login.userPass({ username, password });

    const jobsScroller = await client.search.searchJobs({
      keywords: "Salesforce",
      filters: { location: "India" },
      limit: 20,
      skip: 0,
    });

    const someReactJobHit = await jobsScroller.scrollNext();


    for (const [index, value] of someReactJobHit.entries()) {
      arr.push({
        name: value.hitInfo.jobPosting.companyDetails.company.name,
        title: value.hitInfo.jobPosting.title,
      });
      console.log(JSON.stringify(someReactJobHit[0]))
      break;
    }

    

    const csvWriter = createCsvWriter({
      path: "LinkedIn.csv",
      header: [
        { id: "name", title: "CompanyName" },
        { id: "title", title: "Title" },
      ],
    });

    //joins uploaded file path with root. replace filename with your input field name
    var absolutePath = path.join(root, "../LinkedIn.csv");

    csvWriter.writeRecords(arr).then(() => {
      // sendMailTemplate(
      //   "ravi.ojha@360degreecloud.in",
      //   "Salesforce",
      //   "nuakari data Scraping",
      //   absolutePath
      // );
    });
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
