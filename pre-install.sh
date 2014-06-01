#!/bin/sh

RBN_MODULES=()

get_modules() {
  for DIR in lib/modules/*; do
    if [[ -d $DIR ]]; then
      cd $DIR
      RBN_MODULES+=("`PWD`")
    fi
  done
}

npm_install_modules() {
  for MODULE in ${RBN_MODULES[@]}; do
    cd ${MODULE} && npm install -- production
  done
}

npm_update_modules () {
  for MODULE in ${RBN_MODULES[@]}; do
    cd ${MODULE} && npm update
  done
}

# =================================
# Script Flow
# =================================

get_modules
npm_install_modules
npm_update_modules
