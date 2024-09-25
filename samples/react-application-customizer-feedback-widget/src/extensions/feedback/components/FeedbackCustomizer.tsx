import * as React from "react";
import { useEffect, useState } from "react";
import { BiMessageSquareDetail } from "react-icons/bi";
import { RiCloseCircleLine } from "react-icons/ri";
import { Text } from "@fluentui/react/lib";


import styles from "./FeedbackCustomizer.module.scss";
import { Sp } from "../../../Environment/Env";
import { SuccessPage } from "./SuccessPage";
// import { Site } from "@pnp/sp/sites";
import Sentiment from 'sentiment';


export default function FeedbackCustomizer() {
  const [open, setOpen] = useState(false);
  const [currentUserMail, setCurrentUserMail] = useState("");
  const [userName, setuserName] = useState("");
  const [feedbackComment, setfeedbackComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successFlag, setSuccessFlag] = useState(false);
  const [currentSiteUrl, setSiteUrl] = useState("");

  const handleOpen = () => {
    setOpen(true);
  };

  const handleBtnClose = () => {
    setOpen(false);
    setfeedbackComment("");
    setSuccessFlag(false);
    handleOpen(); // Call handleOpen to show the popup again
  };

  const handleClose = () => {
    setOpen(false);
    setfeedbackComment("");
  };

  useEffect(() => {
    Sp.currentUser()
      .then((user) => {
        setCurrentUserMail(user.UserPrincipalName);
        setuserName(user.Title);
      })
      .catch((error) => {
        console.log(error);
      });

    // set current page siteurl
    let getpageUrl = window.location.href;
    setSiteUrl(getpageUrl);
  }, []);

  const handleTextArea = (event) => {
    setfeedbackComment(event.target.value);
  };

  // Remove Unnecessary Query Parameters from URL 
  const cleanUrl = (url) => {
    const parsedUrl = new URL(url);
    return parsedUrl.origin + parsedUrl.pathname;
};
  
  const handleFeedbackSubmit = async () => {
    const sentiment = new Sentiment();
    const sentimentResult = sentiment.analyze(feedbackComment);
    const sentimentCategory = sentimentResult.score >= 0 ? 'Positive' : 'Negative';
    const encodedUrl = encodeURI(cleanUrl(currentSiteUrl));
    
    if (feedbackComment.trim() === "") {
      setErrorMessage("Comment can't be empty");
    } else if (feedbackComment.length < 30) {
      setErrorMessage("Comment should be at least 50 characters long");
    } else {
      await Sp.lists
        .getByTitle("Feedbacks")
        .items.add({
          Employee_Name: userName,
          Employee_MailId: currentUserMail,
          Comment: feedbackComment,
          Site_URL: {
            // __metadata: { type: 'SP.FieldUrlValue' },
            Url: encodedUrl, 
            Description: "Link to the site" // Description of the URL
          },
          Sentiment: sentimentCategory,
        })
        .then(() => {
          console.log("Message sent successfully");
        })
        .catch((err) => console.log('Error posting to SharePoint:', err));
  
      setErrorMessage("");
      setfeedbackComment("");
      setSuccessFlag(true);
    }
  };

  return (
    <>
      {currentSiteUrl.includes("viewlsts") ? (
        <div></div>
      ) : currentSiteUrl.includes("AllItems") ? (
        <div></div>
      ) : currentSiteUrl.includes("Forms") ? (
        <div></div>
      ) : (
        <div className={styles["feedback-widget-container"]}>
          <div
            className={styles["buttonWrapper"]}
            onClick={open ? handleClose : handleOpen}
          >
            <BiMessageSquareDetail
              style={{ width: "23px", height: "23px", paddingBottom: "4px" }}
            />
            <Text className={styles["text-style"]}>Feedback!!</Text>
          </div>
          {open && (
            <div className={styles["popup-container"]}>
              <div className={styles["header-container"]}>
                <Text
                  style={{
                    color: "#fff",
                    paddingTop: "3px",
                    fontSize: "17px",
                    fontWeight: "500",
                    fontFamily: "Calibre",
                  }}
                >
                  Submit your feedback here!!!
                </Text>
                <RiCloseCircleLine
                  style={{
                    cursor: "pointer",
                    color: "#fff",
                    width: "22px",
                    height: "22px",
                  }}
                  onClick={handleClose}
                />
              </div>
              {successFlag === false ? (
                <div className={styles["feedbackWrapper"]}>
                  <textarea
                    className={styles["textArea__style"]}
                    value={feedbackComment}
                    onChange={handleTextArea}
                    placeholder="Type here..."
                  ></textarea>
                  <p className={styles["errorTxt"]}>{errorMessage}</p>
                  <button
                    className={styles["submitbtn"]}
                    onClick={handleFeedbackSubmit}
                  >
                    Submit
                  </button>
                </div>
              ) : (
                <SuccessPage goBack={handleBtnClose} />
              )}
              <div className={styles["downarrow"]}></div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
