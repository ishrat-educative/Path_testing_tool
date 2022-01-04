// This code open chrome new instance with an existing chrome user profile located at /Users/Ishrat/Desktop/ChromeProfile
// Chrome profile must be created and passed as argument to the webdriver to use login information for educative.io
// There is no need to open chrome in debugger mode, hence, we wont need anything of the following sort
// //options.addArguments('debuggerAddress=127.0.0.1:9222');
var anchor_number = 78; //index strats from 0
var module_number = 2; //index starts from 0

var TIME_OUT = 15000;
var TIME_OUT_TRANSITION = 5000;
var TIME_OUT_5 = 5000;

var path_title = "";
var module_title = "";
var lesson_title = "";

let currentURL = "";

const { Options } = require("selenium-webdriver/chrome");

const fs = require("fs");

const options = new Options();
options.addArguments("--user-data-dir=/Users/Ishrat/Desktop/ChromeProfile");

const webdriver = require("selenium-webdriver"),
  By = webdriver.By,
  until = webdriver.until;

const driver = new webdriver.Builder()
  .setChromeOptions(options)
  .forBrowser("chrome")
  .build();

const quit_chrome = () => {
  //console.log("Chrome closed.");
  driver.quit();
};

const quit = () => {
  //console.log("Quitting chrome...");
  setTimeout(quit_chrome, TIME_OUT_TRANSITION);
};

const saveToFile = (href, hrefTitle, incorrectURLs) => {
  let found = false;
  let hrefsToSave = "";
  let filename = "./" + path_title + "/" + module_title + ".txt";

  if (
    (String(href).startsWith("https://www.educative.io/collection/page/") ||
      String(href).startsWith("https://www.educative.io/courses/")) &&
    !String(href).includes("#")
  ) {
    found = true;
    incorrectURLs++;
    if (parseInt(incorrectURLs) == 1) {
      console.log("SAVING TO FILE ::::::: " + filename);
      let infoToSave =
        "\n Module Title: " +
        module_title +
        "\n" +
        "\t ==>" +
        "Lesson Title: " +
        lesson_title +
        "\n" +
        "\t Lesson URL: " +
        currentURL +
        "\n";
      let dir = "./" + path_title;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir), { recursive: true };
      }
      fs.appendFile(filename, infoToSave, function (err) {
        if (err) console.log(err);
        console.log("Saved to file: " + filename + "Data: \n" + infoToSave);
      });
    }
    hrefsToSave = "\n\t " + hrefTitle + ": " + href;
    console.log("Loogin urls " + incorrectURLs);

    let infoToSave = hrefsToSave + "\n";

    fs.appendFile(filename, infoToSave, function (err) {
      if (err) return; //console.log(err);
      console.log("Saved to file: " + filename + "\n Data: \n" + infoToSave);
    });
  }
  return incorrectURLs;
};

const saveHrefsToFile = (hrefs) => {
  console.log("Insider SaveHREFS...............");
  let incorrectURLs = 0;
  let finished_work = [];

  hrefs.forEach((href, index) => {
    finished_work[index] = false;
  });

  try {
    hrefs.forEach(async (element, index) => {
      //console.log("index for foreach is :" + index);
      //console.log("Inside forEach...before href");

      let href = await element.getAttribute("href");

      //console.log("Inside forEach...after href");

      let hrefTitle = await element.getText();

      //console.log("Inside forEach...after getText()");

      incorrectURLs = await saveToFile(href, hrefTitle, incorrectURLs);

      if (index == hrefs.length - 1) {
        loadNextLesson();
      }
      // mutually exclusive code

      /*const mutex = new Mutex(); // creates a shared mutex instance

      const release = await mutex.acquire(); // acquires access to the critical path
      try {
        finished_work[index] = true;
      } finally {
        release(); // completes the work on the critical path
      }

      if (index == hrefs.length - 1) {
        let done = false;
        while (!done) {
          release = await mutex.acquire(); // acquires access to the critical path
          try {
            finished_work.forEach((element) => {
              if (!element) {
                release();
                return;
              }
            });
            done = true;
          } catch (err) {
            console.log("Error in MUTEX");
          }
        }
        loadNextLesson();
      }*/
    });
  } catch (err) {
    console.log("Writing to recheck.txt");
    let recheck_filename = "recheck.txt";
    let tosave =
      "\n Module Title: " +
      module_title +
      "\n" +
      "\t ==>" +
      "Lesson Title: " +
      lesson_title +
      "\n" +
      "\t Lesson URL: " +
      currentURL +
      "\n" +
      "\t Lesson no: " +
      anchor_number +
      "\n" +
      "\t Module number: " +
      module_number;
    fs.appendFile(recheck_filename, tosave, function (err) {
      if (err) console.log(err);
      console.log("Saved to file: " + filename + "Data: \n" + infoToSave);
    });

    if (index == hrefs.length - 1) {
      loadNextLesson();
    }
  }
};
const parseHREFs = async () => {
  //console.log("Getting hrefs");

  driver.getCurrentUrl().then((url) => {
    currentURL = url;
    //console.log("Current URL " + url);
  });

  driver
    .wait(
      until.elementsLocated(By.xpath("//div[@class='block']//a")),
      TIME_OUT,
      "Timed out after 30 seconds",
      1000
    )
    .then((hrefs) => {
      //found = true;

      saveHrefsToFile(hrefs);
      //loadNextLesson();
    })
    .catch((err) => {
      //console.log("No hrefs found at " + currentURL);
      loadNextLesson();
    });
};

const setChromeWindow = (window_position) => {
  driver.getAllWindowHandles().then(async (windows) => {
    //console.log("Chrome current windows: " + windows.length);
    if (window_position != 0) {
      await driver.switchTo().window(windows[windows.length - 1]);
    } else await driver.switchTo().window(windows[0]);
    driver.getCurrentUrl().then((url) => {
      //console.log("Current URL " + url);
    });
  });
};

function loadNextLesson_sub() {
  driver.getCurrentUrl().then((url) => {
    console.log(
      "loading lesson at URL: " +
        url +
        " lesson no: " +
        anchor_number +
        " module no: " +
        module_number
    );
  });
  driver
    .wait(
      until.elementsLocated(
        By.xpath(
          "//div[@class='styles__ArticleTitle-sc-1ttnunj-6 hyCmOh']//span[@class='overflow-ellipsis overflow-hidden whitespace-nowrap max-w-sm text-base']//a"
        )
      ),
      TIME_OUT,
      "Timed out after 30 seconds",
      10000
    )
    .then(async (links) => {
      if (anchor_number < links.length) {
        lesson_title = await links[anchor_number].getText();
        console.log("Lesson title:" + lesson_title);
        links[anchor_number].click();
        anchor_number++;

        setTimeout(parseHREFs, TIME_OUT_TRANSITION);
        //loadNextLesson(); //this should be removed and line above should be uncommented
      } else {
        anchor_number = 0;
        loadNextModule();
      }
    })
    .catch((err) => {
      driver.getCurrentUrl().then((url) => {
        console.log(
          "Element on module editor NOT found: " + err + "at URL: " + url
        );
        driver.navigate().to(url);
        setTimeout(loadNextLesson, TIME_OUT_TRANSITION);

        //console.log("at URL: " + url);
        //console.log(
        // "at lesson " + anchor_number + " in module " + module_number
        //);
      });
    });
}

const loadNextLesson = async () => {
  if (anchor_number != 0) {
    await driver.navigate().back();
    //console.log("Moving back");
  }
  /*//console.log(
    "anchor to look for: " +
      "//div[@class='styles__ArticleTitle-sc-1ttnunj-6 kmIYWG']//span[@class='overflow-ellipsis overflow-hidden whitespace-nowrap max-w-sm text-base']//a[" +
      anchor_number +
      "]"
  );*/

  //loadNextLesson_sub();
  setTimeout(loadNextLesson_sub, TIME_OUT_TRANSITION);
};
const getModuleEditorPage = () => {
  setChromeWindow(module_number);
  setTimeout(loadNextLesson, TIME_OUT_5);
  //loadNextModule();
};

const loadNextModule = () => {
  console.log("Load next Module");
  setChromeWindow(0);
  driver
    .wait(
      until.elementsLocated(
        By.xpath(
          "//div[@class='styles__CollectionCategoryEditStyled-sc-13zj5pa-0 hxEHPy']//div[@class='styles__Header-sc-13zj5pa-4 kBijSp']//button[@class='icon-default rounded-full'][2]"
        )
      ),
      TIME_OUT,
      "Timed out after 30 seconds",
      1000
    )
    .then((moduleEditButtons) => {
      console.log("Load next Module 2");
      driver
        .wait(
          until.elementsLocated(
            By.xpath(
              '//div[@class="styles__CollectionCategoryEditStyled-sc-13zj5pa-0 hxEHPy"]//div[@class="styles__Header-sc-13zj5pa-4 kBijSp"]//span'
            )
          ),
          TIME_OUT,
          "Timed out after 30 seconds",
          1000
        )
        .then((moduleTitles) => {
          console.log(
            "Load next Module 3" + module_number + " " + module.length
          );
          if (module_number < moduleEditButtons.length) {
            console.log("Load next Module 4");
            console.log("Modules found : " + moduleEditButtons.length);
            console.log("Loading Module....: " + (module_number + 1));
            //console.log("Module span: " + module_title);

            moduleTitles[module_number].getText().then((text) => {
              module_title = text;
              console.log("Module title:::: " + module_title);
            });
            moduleEditButtons[module_number].click();
            module_number++;
            //loadNextModule();
            setTimeout(getModuleEditorPage, 10000);
          } else {
            //console.log("Path testing completed");
            quit();
          }
        });
    })
    .catch((err) => {
      console.log("Load next Module");
      console.log("Module Edit Button Not found: Quitting... " + err);
      quit();
    });
};

const fetchPathTitle = () => {
  driver
    .wait(
      until.elementLocated(
        By.xpath(
          "//div[@class='AuthorAndTitle-sc-1l2rdhx-0 gwCXdZ']//h1[@class='text-4xl font-semibold text-center mr-0 sm:text-left mt-0 ml-0 sm:mr-8 mb-4']"
        )
      ),
      TIME_OUT,
      "Timed out after 30 seconds",
      1000
    )
    .then((module_h1) => {
      module_h1.getAttribute("textContent").then((title) => {
        path_title = title;
        console.log("Path Title :: " + path_title);
        loadNextModule();
      });
    })
    .catch(() => {
      console.log("Path title could not be fetched");
    });
};

const getPathEditorPage = async () => {
  await driver.get(
    "https://www.educative.io/patheditor/10370001/4800727609769984"
  );

  setTimeout(fetchPathTitle, 5000);
};

getPathEditorPage();
