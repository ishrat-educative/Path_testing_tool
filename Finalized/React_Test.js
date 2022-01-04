// This code open chrome new instance with an existing chrome user profile located at /Users/Ishrat/Desktop/ChromeProfile
// Chrome profile must be created and passed as argument to the webdriver to use login information for educative.io
// There is no need to open chrome in debugger mode, hence, we wont need anything of the following sort
// //options.addArguments('debuggerAddress=127.0.0.1:9222');

var anchor_number = 0;

var module_number = 1;

var path_title = "";
var module_title = "";
var lesson_title = "";

let currentURL = "";

var TIME_OUT = 10000;
var TIME_OUT_TRANSITION = 10000;
var TIME_OUT_5 = 5000;

const { Options } = require("selenium-webdriver/chrome");

//const successlog = require("./logger22").logger;

const fs = require("fs-extra");

const options = new Options();
options.addArguments("--user-data-dir=/Users/Ishrat/Desktop/ChromeProfile2");

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

const saveHrefsToFile = (hrefs) => {
  let found = false;
  let hrefsToSave = "";
  let incorrectURLs = 0;
  console.log("Insider SaveHREFS...............");
  hrefs.forEach((element, index) => {
    element.getAttribute("href").then((href) => {
      href = href + "\n";
      if (
        (String(href).startsWith("https://www.educative.io/collection/page/") ||
          String(href).startsWith("https://www.educative.io/courses/")) &&
        !String(href).includes("#")
      ) {
        found = true;

        console.log("SETING IT TRUEEEEEEEEEEEEEEEEEEE........." + found);
        incorrectURLs++;
        if (parseInt(incorrectURLs) == 1) {
          let filename = path_title + "/" + module_title + ".txt";
          let infoToSave =
            "Module Title: " +
            module_title +
            "\n" +
            "\t ==>" +
            "Lesson Title: " +
            lesson_title +
            "\n" +
            "\t Lesson URL: " +
            currentURL +
            "\n";
          fs.appendFile(filename, infoToSave, function (err) {
            if (err) return; //console.log(err);
            console.log("Saved to file: " + filename + "Data: \n" + infoToSave);
          });
        }
        element.getText().then((anchor_title) => {
          hrefsToSave = "\n\t " + anchor_title + ": " + href;
          console.log("Loogin urls " + incorrectURLs);

          let filename = module_title + ".txt";
          let infoToSave = hrefsToSave + "\n";

          fs.appendFile(filename, infoToSave, function (err) {
            if (err) return; //console.log(err);
            console.log("Saved to file: " + filename + "Data: \n" + infoToSave);
          });
        });
      }
    });
    if (index == hrefs.length - 1) {
      loadNextLesson();
    }
  });
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
      5000
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
          "//div[@class='styles__ArticleTitle-sc-1ttnunj-6 kmIYWG']//span[@class='overflow-ellipsis overflow-hidden whitespace-nowrap max-w-sm text-base']//a"
        )
      ),
      TIME_OUT,
      "Timed out after 30 seconds",
      5000
    )
    .then(async (links) => {
      if (anchor_number < links.length) {
        //if (anchor_number < 2) {
        //console.log(
        // "Total Lessons :" + links.length + " in Module : " + module_number
        // );
        /*  successlog.info(
          "Total Lessons :" + links.length + " in Module : " + module_number
        );
        //console.log("Current lesson : " + (anchor_number + 1));
        successlog.info("Current lesson : " + (anchor_number + 1)); */

        /*links[anchor_number].getAttribute("text").then((text) => {
          lesson_title = text;
        });
        //console.log("Lesson title:" + lesson_title);*/
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
  setChromeWindow(0);
  console.log("s");
  driver
    .wait(
      until.elementsLocated(
        By.xpath(
          "//div[@class='styles__CollectionCategoryEditStyled-sc-13zj5pa-0 hxEHPy']//div[@class='styles__Header-sc-13zj5pa-4 kBijSp']//button[@class='icon-default rounded-full'][2]"
        )
      ),
      TIME_OUT,
      "Timed out after 30 seconds",
      5000
    )
    .then((moduleEditButtons) => {
      driver
        .wait(
          until.elementsLocated(
            By.xpath(
              '//div[@class="styles__CollectionCategoryEditStyled-sc-13zj5pa-0 hxEHPy"]//div[@class="styles__Header-sc-13zj5pa-4 kBijSp"]//span'
            )
          ),
          TIME_OUT,
          "Timed out after 30 seconds",
          5000
        )
        .then((moduleTitles) => {
          if (module_number < moduleEditButtons.length) {
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
            setTimeout(getModuleEditorPage, TIME_OUT_TRANSITION);
          } else {
            //console.log("Path testing completed");
            quit();
          }
        })
        .catch();
    })
    .catch((err) => {
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
      5000
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
  //console.log("Opening PATH EDITOR");

  //ASP.net
  await driver.get(
    "https://www.educative.io/patheditor/10370001/5168843929944064"
  );

  //C++
  /* await driver.get(
    "https://www.educative.io/patheditor/10370001/4767671563321344"
  );*/

  //Django

  /*await driver.get(
    "https://www.educative.io/patheditor/10370001/6306887466745856"
  );*/
  // Testing React

  /*await driver.get(
    "https://www.educative.io/patheditor/10370001/4924538879475712"
  );*/

  /*driver
    .wait(
      until.elementLocated(
        By.xpath(
          "//div[@class='styles__ArticleTitle-sc-1ttnunj-6 kmIYWG']//span[@class='overflow-ellipsis overflow-hidden whitespace-nowrap max-w-sm text-base']//a"
        )
      ),
      TIME_OUT,
      "Timed out after 30 seconds",
      5000
    )
    .then((module_h1) => {
      module_h1.getAttribute("text").then((title) => {
        path_title = title;
      });
    })
    .catch(() => {
      console.log("Path title could not be fetched");
    });*/

  setTimeout(fetchPathTitle, 5000);
};

getPathEditorPage();
