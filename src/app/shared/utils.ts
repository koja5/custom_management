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