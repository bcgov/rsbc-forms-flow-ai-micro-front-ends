import React, { JSX } from "react";
import { formsPNGVersions } from "../helpers/helperServices";
import { SVGprint } from "./svgPrint";
import { OfflineFetchService } from "../formsflow-rsbcservices";

interface ComponentSettings {
  stage?: string;
}

class PrintServices {
  async renderSVGForm(
    values: Record<string, any>,
    isEditMode: boolean,
    builderMode: boolean,
    renderStage: string,
    isForSubmissionPayload: boolean
  ): Promise<JSX.Element[]> {    
    let impoundLotOperators = await OfflineFetchService.fetchStaticDataFromTable(
      "impoundLotOperators"
    );

    const isPreview = this.determinePreviewMode(isEditMode, builderMode);
    const valuesCopy = this.prepareValuesCopy(values);

    return this.generateComponents(
      valuesCopy,
      impoundLotOperators,
      renderStage,
      isPreview,
      isForSubmissionPayload
    );
  }

  private determinePreviewMode(
    isEditMode: boolean,
    builderMode: boolean
  ): boolean {
    return isEditMode || builderMode;
  }

  private prepareValuesCopy(values: Record<string, any>): Record<string, any> {
    const valuesCopy = { ...values };
    if (values["vehicle_impounded"] === "YES") {
      valuesCopy["date_released"] = null;
      valuesCopy["time_released"] = null;
    }
    if (values["IRP"]) {
      if (!values["VI"]) {
        valuesCopy["VI_number"] = null;
      }
      valuesCopy["driver_licence_no_irp"] = values["driver_licence_no"];
      if (values["drivers_licence_jurisdiction"] && 
          values["drivers_licence_jurisdiction"].value !== "CA_BC") {
        valuesCopy["driver_licence_no_irp"] = null;
        valuesCopy["out_of_province_DL"] = values["driver_licence_no"];
      }
    }
    return valuesCopy;
  }

  private generateComponents(
    values: Record<string, any>,
    impoundLotOperators: any,
    renderStage: string,
    isPreview: boolean,
    isForSubmissionPayload: boolean
  ): JSX.Element[] {
    const forms = {
      TwentyFourHour: values["TwentyFourHour"],
      TwelveHour: values["TwelveHour"],
      VI: values["VI"],
      IRP: values["IRP"],
    };

    const componentsToRender: JSX.Element[] = [];

    for (const item in forms) {
      if (!forms[item]) continue;
      const components = this.generateFormComponents(
        item,
        forms[item],
        values,
        impoundLotOperators,
        renderStage,
        isPreview,
        isForSubmissionPayload
      );
      if (components.length > 0) {
        componentsToRender.push(
          React.createElement("div", { id: item, key: item }, components)
        );
      }
    }

    return componentsToRender;
  }

  private generateFormComponents(
    item: string,
    form: any,
    values: Record<string, any>,
    impoundLotOperators: any,
    renderStage: string,
    isPreview: boolean,
    isForSubmissionPayload: boolean
  ): JSX.Element[] {
    const components: JSX.Element[] = [];
    const formVersion = values["form_version"] || "version1";

    for (const formKey in formsPNGVersions?.[formVersion]?.[renderStage]?.[item] || {}) {
      if (this.shouldSkipComponent(formKey, item, values)) continue;
      components.push(
        React.createElement(SVGprint, {
          key: `${item}-${formKey}`,
          form: formsPNGVersions?.[formVersion]?.[renderStage]?.[item]?.[formKey]?.["png"] || "",
          formAspect:
            formsPNGVersions?.[formVersion]?.[renderStage]?.[item]?.[formKey]?.["aspectClass"] || "",
          formLayout: item,
          formType: formKey,
          formVersion: values["form_version"] || "version1",
          values: values,
          impoundLotOperators: impoundLotOperators,
          renderStage: renderStage,
          isPreview: isPreview,
          isForSubmissionPayload: isForSubmissionPayload,
        })
      );
    }
    return components;
  }

  private shouldSkipComponent(
    formKey: string,
    item: string,
    values: Record<string, any>
  ): boolean {
    return (
      (formKey === "ILO" &&
        values["VI"] &&
        values["TwentyFourHour"] &&
        item === "TwentyFourHour") ||
      (formKey === "ILO" && values["vehicle_impounded"] === "NO") ||
      (formKey === "DETAILS" && values["incident_details"]?.length < 500)
    );
  }
}

export default PrintServices;
