# Distributed Print Jobs Component

## Overview

This is a Harper component is designed to ingest jobs from a central print server and distribute jobs to remote printers upon request via a REST interface. The component is designed specifically to match the API specs for STAR and Epson brand printers.

### What is Harper
Harper is a Composable Application Platform that merges database, cache, app logic, and messaging into a single runtime. Components like this plug directly into Harper, letting you build and scale distributed services fast, without managing separate systems. Built for geo-distributed apps with low latency and high uptime by default.

## Getting Started

1. `git clone https://github.com/HarperDB/print-jobs.git`

1. `cd print-jobs`
1. `npm run build`
1. `harperdb run .`

This assumes you have the Harper stack already installed. [Install Harper](https://docs.harperdb.io/docs/deployments/install-harperdb) globally.

## Usage

### Endpoints

| Endpoint                                                             | Description                                 |
| -------------------------------------------------------------------- | ------------------------------------------- |
| `/print-job`                                                         | Direct REST endpoint for the PrintJob table |
| `/restservices/cwpos/v1/cloudPrinterServices/service/printers`       | Add new jobs (STAR or Epson)                |
| `/restservices/cwpos/v1/cloudPrinterServices/printers`               | Retrieve/Delete STAR Jobs                   |
| `/restservices/cwpos/v1/cloudPrinterServices/service/printers/epson` | Retrieve/Delete Epson Jobs                  |

The Harper REST API gives low level control over your data. The last two endpoints are component level and provide higher level functionality. The first is direct access to Harper's REST API. For a full description of what the REST API can do and how to use if your can refer to its [documentation](https://docs.harperdb.io/docs/developers/rest).

### STAR Jobs Flow

##### Add new print job:

Central print server PUTs a new STAR job into Harper. Internally Harper makes an external request to ingest the actual print job data.

```
PUT [HARPER_GTM_URL]/restservices/cwpos/v1/cloudPrinterServices/service/printers

Headers:
uniquePrinterId: 00:11:62:0e:48:a7

BODY: {"jobReady":true,"mediaTypes":["application/vnd.star.line","application/vnd.star.linematrix","application/vnd.star.starprnt","application/vnd.star.starprntcore","text/vnd.star.markup"],"jobToken":"1738946726625"}

Response: 204 No Content
```

##### Retrieve Job:

START Printer retrieves job ready status via POST request

```
POST [HARPER_GTM_URL]/restservices/cwpos/v1/cloudPrintServices/printers
QUERY PARAMS: {"t":"1738946267"}
BODY:
//printerMAC is the identifier for which printer this is routed to/from
{
    "status": "23 6 4 0 0 0 0 0 0 ",
    "printerMAC": "00:11:62:0e:48:a7",
    "statusCode": "200%20OK",
    "printingInProgress": false,
    "clientAction": null
}

RESPONSE FOR JOB: 200
{"jobReady":true,"mediaTypes":["application/vnd.star.line","application/vnd.star.linematrix","application/vnd.star.starprnt","application/vnd.star.starprntcore","text/vnd.star.markup"],"jobToken":"1738946726625"}

RESPONSE FOR NO JOB: 200
```

##### Delete Job:

Printer requests to delete job upon completion (This operation is pass through. Record will be deleted in Harper and a request will be passed on to the pass through host set in environment variables)

```
DELETE [HARPER_GTM_URL]/restservices/cwpos/v1/cloudPrintServices/printers
QUERY PARAMS: {"code":"200 OK","mac":"00:11:62:0e:48:a7","token":"1738946726625"}

RESPONSE: 200 No Content
```

### Epson Flow

#### Add new print job:

Central print server PUTs a new Epson job into Harper. Print job data is provided and stored in XML format.

```
PUT [HARPER_GTM_URL]/restservices/cwpos/v1/cloudPrinterServices/service/printers

Headers:
uniquePrinterId: coolPrinterName

BODY:
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<PrintRequestInfo Version="2.00">
    <ePOSPrint>
        <Parameter>
            <printjobid>1738944642280</printjobid>
        </Parameter>
        <PrintData> <!--object includes supplimental job information for when cash drawer needs to be open-->
            <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
                <pulse drawer="drawer_1" time="pulse_100" />
            </epos-print>
        </PrintData>
    </ePOSPrint>
</PrintRequestInfo>

Response: 204 No Content
```

##### Retrieve print job:

Retrieves an EPSON job by unique printer name and job token.

```
POST [HARPER_GTM_URL]/restservices/cwpos/v1/cloudPrinterServices/service/printers/epson
BODY:
ConnectionType=GetRequest&ID=&Name=X6WY351989
Form Parameter of the unique id of printer is Name

RESPONSE FOR JOB: 200 Content-Type: text/xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<PrintRequestInfo Version="2.00">
    <ePOSPrint>
        <Parameter>
            ...
        </Parameter>
        <PrintData> <!--object includes supplimental job information for when cash drawer needs to be open-->
            <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
                <pulse drawer="drawer_1" time="pulse_100" />
            </epos-print>
        </PrintData>
    </ePOSPrint>
</PrintRequestInfo>

RESPONSE FOR NO JOB:
200 No Content
```

#### Delete Job:

Printer requests to delete job upon completion (This operation is pass through. Record will be deleted in Harper and a request will be passed on to the pass through host set in environment variables)

```
POST [HARPER_GTM_URL]/restservices/cwpos/v1/cloudPrinterServices/service/printers/epson
BODY:

ConnectionType=SetResponse&ID=&Name=X6WY351989&ResponseFile=<?xml version="1.0" encoding="UTF-8"?>
<PrintResponseInfo Version="2.00">
  <ePOSPrint>
    <Parameter>
      <devid>local_printer</devid>
      <printjobid>1738944642280</printjobid>
    </Parameter>
    <PrintResponse>
      <response xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print" success="true" code="" status="251658262"  battery="0"/> <!--job response for determining success or failure-->
    </PrintResponse>
  </ePOSPrint>
  <ePOSPrint>
    <Parameter>
      <devid>local_printer</devid>
      <printjobid>1738944642280</printjobid>
    </Parameter>
    <PrintResponse>
      <response xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print" success="true" code="" status="251658258" battery="0"/>
    </PrintResponse>
  </ePOSPrint>
</PrintResponseInfo>

RESPONSE: 200 No Content
```

### Reporting

The `PrintJob` table can be directly queried for reporting purposes by making a GET request to `/print-job`.

Example:

```
GET /print-job?uniquePrinterId=xxxxxxxx&createdAt=gt=xxxxxx&status=[ready|fetched]
```

## Data Model

### PrintJob Table

| Name                      | Description                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| `uniquePrinterIdJobToken` | **_(Primary Key; String; Required)_** Combination of uniquePrinterId and jobToken fields  |
| `uniquePrinterId`         | **_(String; Required)_** Unique identifier for printer                                    |
| `jobToken`                | **_(String; Required)_** Identifier for the print job                                     |
| `status`                  | **_(Enum Value; Required)_** 'ready' / 'fetched'                                          |
| `printerType`             | **_(Enum Value; Required)_** 'epson' / 'star'                                             |
| `jobData`                 | **_(String)_** Print job data in XML format for EPSON and BYTE CODE for STAR              |
| `starPollResponse`        | **_(JSON Object)_** Contains the initial response for the Star printer (without job data) |
| `createdAt`               | **_(Float)_** Timestamp of record creation (auto applied by database)                     |
| `fetchedAt`               | **_(Float)_** Timestamp of print job data being sent to printer                           |

## Testing

The file `test/printJob.test.js` has regression tests with the intention of covering all of that above API calls. Run them with:

```
node --test
```

The test uses a `.env` file at the componet root for configuration

## Environment Variables

To run the component and tests, you will need to set up a `.env` file in the root of the component directory. This file should contain the following fields:

| Field              | Description                                   |
| ------------------ | --------------------------------------------- |
| PASS_THROUGH_HOST  | host to send pass thru delete requests        |
| TEST_REST_HOST     | harper host to use for test cases (with port) |
| TEST_USE_AUTH      | Should HTTP Basic auth be sent? true/false    |
| TEST_REST_USERNAME | The username for basic auth                   |
| TEST_REST_PASSWORD | The passowrd for basic auth                   |

Copy the `.env.example` file to `.env` and fill in appropriate values
