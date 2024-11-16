// src/components/SEO.js
import React from "react";
import { Helmet } from "react-helmet";

const Seo = ({ title, description, keywords }) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
  </Helmet>
);

export default Seo;
