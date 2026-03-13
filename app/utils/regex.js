export const IS_EMAIL = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/
export const IS_DESCRIPTION = /^[a-zA-ZÀ-ÿ\s,.!?:()'-]+$/
export const IS_STRING = /^[a-zA-Z]+$/
export const IS_PASSWORD = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
export const IS_ADDRESS = /^\d{1,3}\s[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+,\s?\d{5},\s?[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/
export const IS_BAR_NAME = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(\s[A-Za-zÀ-ÖØ-öø-ÿ]+){0,3}$/
export const IS_CODE_NUMBER = /^\d{6}$/
export const IS_ID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
