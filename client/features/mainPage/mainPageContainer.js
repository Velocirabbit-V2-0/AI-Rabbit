import React from "react";
import { GalleryContainer } from "../gallery/galleryContainer";
import { SearchComponent } from "./searchComponent";
import { useState, useEffect } from "react";
// import { useParams, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import BlobView from "../testRenderBlob/blobView";

export function MainPage() {
  const [searchTerm, setSearchTerm] = useState("");
  // const { viewParam } = useParams(); 
  const [location, setLocation] = useState('grid');


  const searchTermHandler = (searchFieldValue) => {
    setSearchTerm(searchFieldValue);
  };

  // useEffect(() => {
  //   if (viewParam) {
  //     setLocation(viewParam);
  //   }}, [viewParam]); 

  return (
    <>
      {/* <BlobView></BlobView> */}
      <div className="header">
        <a href="#default" className="logo">
          PsychOptica
        </a>
        <div className="header-right">
          <Link to="/" className="active">
            Home
          </Link>
          <Link to="/favorites" className='active'>
            Favorites
          </Link>
          <a href="#contact">Contact</a>
          <a href="#about">About</a>
          <Link to="/login" className="loginButton">
            Login
          </Link>
        </div>
      </div>
      <div className="mainPage">
        <SearchComponent searchHandler={searchTermHandler} />
        {/* <ImageUploadComponent /> */}
        {layout === '/base' && (
          <GalleryContainer submittedSearchTerm={searchTerm} />
        )}
        {/* This second line - change string and component name */}
        {layout === '/base' && (
          <GalleryContainer submittedSearchTerm={searchTerm} />
        )}
      </div>
    </>
  );
}
