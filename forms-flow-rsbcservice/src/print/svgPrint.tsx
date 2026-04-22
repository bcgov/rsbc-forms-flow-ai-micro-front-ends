import React, { useEffect, useState } from "react";
import { printFormatHelper, printCheckHelper } from "../helpers/helperServices";
import "./svgPrint.scss";
import formFieldLayoutVersion1 from "./version1/print_layout.json";
import formFieldLayoutVersion2 from "./version2/print_layout.json";

const formFieldLayouts = {
  version1:  formFieldLayoutVersion1,
  version2: formFieldLayoutVersion2,
};

interface SVGPrintProps {
  form: string;
  formAspect: string;
  formLayout: string;
  formType: string;
  formVersion: string;
  values: Record<string, any>;
  impoundLotOperators: any;
  renderStage: string;
  isPreview: boolean;
  isForSubmissionPayload: boolean;
}

// A React component that renders an SVG-based print layout using predefined form field positions and user-provided values.
export const SVGprint: React.FC<SVGPrintProps> = ({
  form,
  formAspect,
  formLayout,
  formType,
  formVersion,
  values,
  impoundLotOperators,
  renderStage,
  isPreview,
  isForSubmissionPayload,
}) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const formFields = formFieldLayouts[formVersion]?.[formLayout]?.[formType];
  const allFormFields = formFieldLayouts[formVersion]?.[formLayout]?.["fields"];
  const viewBox = formFieldLayouts[formVersion]?.[formLayout]?.["viewbox"];

  let svgStyle: React.CSSProperties = {};

  useEffect(() => {
    // Fetch and convert images to base64 when needed
    const preloadImage = async (imageSrc: string) => {
      try {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error loading image:', error);
        return null;
      }
    };
    
    // Only convert if needed
    if (form) {
      preloadImage(form).then(base64Image => {
        if (base64Image) {
          // Store the base64 image in state
          setImageData(base64Image);
        }
      });
    }
  }, [form]);

  if (Object.keys(values).length) {
    if (renderStage === "stageTwo" && isForSubmissionPayload) {
      if (formLayout === "TwelveHour") {
        svgStyle = { marginTop: "28px" };
      } else if (formLayout === "TwentyFourHour") {
        svgStyle = {
          marginLeft: "0px",
          marginRight: "0px",
          marginTop: "28px",
          marginBottom: "0px",
        };
      } else if (formLayout === "VI" || formLayout === "IRP") {
        svgStyle = isPreview
          ? {
              marginLeft: "0px",
              marginRight: "0px",
              marginTop: "50px",
              marginBottom: "40px",
            }
          : {
              marginLeft: "-430px",
              marginRight: "-280px",
              marginTop: "50px",
              marginBottom: "40px",
            };
      }
    }

    return (
      <div style={svgStyle}>
        <svg
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
          className={"svg-wrapper" + formAspect}
        >
          <image href={imageData || form} width="223" height="202" crossOrigin="anonymous" />
          {formFields?.map((item: string) => {
            const fieldKey = item;
            const field = allFormFields?.[item];
            if (!field) return null;

            if (field["field_type"] === "text") {
              return (
                <text
                  key={fieldKey}
                  id={item}
                  x={`${field["start"]["x"]}px`}
                  y={`${field["start"]["y"]}px`}
                  className={field["classNames"]}
                  fill="black"
                >
                  {printFormatHelper(values, field, item, impoundLotOperators)}
                </text>
              );
            } else if (field["field_type"] === "checkbox") {
              return (
                <text
                  key={fieldKey}
                  id={item}
                  x={field["start"]["x"]}
                  y={field["start"]["y"]}
                  className={field["classNames"]}
                >
                  {printCheckHelper(values, field, item) ? "X" : null}
                </text>
              );
            } else if (field["field_type"] === "always") {
              return (
                <text
                  key={fieldKey}
                  id={item}
                  x={field["start"]["x"]}
                  y={field["start"]["y"]}
                  className={field["classNames"]}
                >
                  {field["field_value"]}
                </text>
              );
            } else if (field["field_type"] === "textArea") {
              return (
                <foreignObject
                  key={fieldKey}
                  id={item}
                  x={`${field["start"]["x"]}px`}
                  y={`${field["start"]["y"]}px`}
                  className={field["classNames"]}
                >
                  {printFormatHelper(values, field, item, impoundLotOperators)}
                </foreignObject>
              );
            }
            return null;
          })}
        </svg>
      </div>
    );
  }
  return <div />;
};
