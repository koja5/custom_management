export function checkIfInputValid(inputId: string): boolean {
  const element = document.getElementById(inputId);
  if (!element) return false;
  if (
    element.classList.contains("ng-invalid") &&
    (element.classList.contains("ng-touched") ||
      element.classList.contains("ng-dirty"))
  )
    return true;
  return false;
}

export function checkIfInputValueValid(
  value: string,
  inputId: string
): boolean {
  const element = document.getElementById(inputId);
  if (!element) return false;
  if (
    (!value || value === "") &&
    (element.classList.contains("ng-touched") ||
      element.classList.contains("ng-dirty"))
  ) {
    element.classList.add("ng-invalid");
    return true;
  }
  element.classList.remove("ng-invalid");
  return false;
}

export function checkIsValidDate(date: any) {
  return !isNaN(date) && date instanceof Date;
}
