const form = document.getElementById('form');

const extensionKey = document.getElementById('extensionKey');
const sqlData = document.getElementById('sqlData');
const modelData = document.getElementById('modelData');
const tcaData = document.getElementById('tcaData');
const lllData = document.getElementById('lllData');

dataObject = [];


form.addEventListener('submit', function(e){
  e.preventDefault();
  timeStamp = e.timeStamp;
  dataObject = [];
  sqlToArray(sqlData.value);
  modelTemplate(dataObject);
  lllTemplate(dataObject);
  tcaTemplate(dataObject);

});


function sqlToArray(sql){
  if (sql) {
    fields = sql.split("\n");



    fields.forEach( function(field){
      tmp = field.split(" ");

      if (tmp[0]) {
        fieldType = tmp[1].split("(");
        varType = fieldType[0];
        cCap = customCapitalize(tmp[0])
        cCamelize = camelize(cCap)
        dataObject.push( {
          fieldName: tmp[0],
          fieldType: varType,
          propertyType: (varType == "tinyint") ? "bool" : (varType == "int") ? "int" : "string",
          variableName: cCamelize,
          propertyName: cCap,
          propertyForGetSet: customCapitalize(cCamelize)
        })
      }
    })

  }


}
function tcaTemplate(dataAsArray){
  let date = new Date()
  tcaData.value
  = `<?php
if (!defined('TYPO3_MODE')) {
    die('Access denied.');
}

$fields = [`;
  dataObject.forEach( function(f){
    tcaData.value += `
    '${f.fieldName}' => [
        'exclude' => true,
        'label' => 'LLL:EXT:${extensionKey.value}/Resources/Private/Language/locallang_db.xlf:${f.variableName}',
        'config' => [
            'type' => 'input',
            'size' => 15
        ],
    ],
        `;
  })
  tcaData.value += `
];

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('tx_XYZ_domain_model_XYZ', $fields);`;
}
function lllTemplate(dataAsArray){
  let date = new Date()
  lllData.value
  = `<?xml version="1.0" encoding="utf-8" standalone="yes" ?>
<xliff version="1.0">
	<file source-language="en" datatype="plaintext" original="messages" date="${date.toISOString()}" product-name="${extensionKey.value}">
		<header/>
		<body>
    `;
  dataObject.forEach( function(f){
    lllData.value += `      <trans-unit id="${f.variableName}">
          <source>${f.propertyName}</source>
        </trans-unit>
        `;
  })
  lllData.value
  += `  </body>
  </file>
</xliff>`;
}

function modelTemplate(dataAsArray){
  modelData.value = "";
  dataObject.forEach( function(f){
    modelData.value += `
/**
* @var ${f.propertyType}
*/
protected $${f.variableName};
    `;
  })
  dataObject.forEach( function(f){
    modelData.value += `
/**
 * Get ${f.propertyName}
 *
 * @return ${f.propertyType}
 */
public function get${f.propertyForGetSet}()
{
    return $this->${f.variableName};
}

/**
 * Set ${f.propertyName}
 *
 * @param ${f.propertyType} $${f.variableName} ${f.propertyName}
 */
public function set${f.propertyForGetSet}($${f.variableName})
{
    $this->${f.variableName} = $${f.variableName};
}
    `;
  })
}

function customCapitalize(str) {
  return str.charAt(0).toUpperCase() + str.replace("_"," ").slice(1)
}
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}


function copyText(fieldId) {
  var copyText = document.getElementById(fieldId);
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
}
