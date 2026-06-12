Feature: Autenticación de Usuario

  Scenario: Inicio de sesión exitoso
    Given el usuario está en la página de login
    When ingresa credenciales válidas
    Then debería ser redirigido al panel principal
