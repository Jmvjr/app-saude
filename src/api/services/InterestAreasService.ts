/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomInterestAreaCreate } from "../models/CustomInterestAreaCreate";
import type { InterestAreaCreate } from "../models/InterestAreaCreate";
import type { InterestAreaUpdate } from "../models/InterestAreaUpdate";
import type { PatchedInterestAreaUpdate } from "../models/PatchedInterestAreaUpdate";
import type { PatchedMarkAttentionPoint } from "../models/PatchedMarkAttentionPoint";
import type { PersonInterestArea } from "../models/PersonInterestArea";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class InterestAreasService {
  /**
   * @param requestBody
   * @returns any No response body
   * @throws ApiError
   */
  public static personCustomInterestAreaCreate(
    requestBody: CustomInterestAreaCreate,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/person/custom-interest-area",
      body: requestBody,
      mediaType: "application/json",
    });
  }
  /**
   * @returns PersonInterestArea
   * @throws ApiError
   */
  public static personInterestAreasList(): CancelablePromise<
    Array<PersonInterestArea>
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/person/interest-areas",
    });
  }
  /**
   * @param requestBody
   * @returns any No response body
   * @throws ApiError
   */
  public static personInterestAreasCreate(
    requestBody: InterestAreaCreate,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/person/interest-areas",
      body: requestBody,
      mediaType: "application/json",
    });
  }
  /**
   * @param requestBody
   * @returns InterestAreaUpdate
   * @throws ApiError
   */
  public static personInterestAreasPartialUpdate(
    requestBody?: PatchedInterestAreaUpdate,
  ): CancelablePromise<InterestAreaUpdate> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/person/interest-areas",
      body: requestBody,
      mediaType: "application/json",
    });
  }
  /**
   * Marcar área como ponto de atenção
   * @param requestBody
   * @returns void
   * @throws ApiError
   */
  public static markObservationAsAttentionPoint(
    requestBody?: PatchedMarkAttentionPoint,
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/person/interest-areas/mark-attention-point/",
      body: requestBody,
      mediaType: "application/json",
    });
  }
}
