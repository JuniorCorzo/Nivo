package dev.angelcorzo.nivo.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

class ArchitectureTest {

    private static JavaClasses importedClasses;

    @BeforeAll
    static void setUp() {
        importedClasses = new ClassFileImporter()
                .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages("dev.angelcorzo.nivo");
    }

    @Test
    @DisplayName("Domain must not depend on external frameworks, infrastructure, or config")
    void domainMustNotDependOnExternalFrameworks() {
        ArchRule rule = noClasses()
                .that()
                .resideInAPackage("dev.angelcorzo.nivo.domain..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage(
                        "org.springframework..",
                        "jakarta.persistence..",
                        "dev.angelcorzo.nivo.infrastructure..",
                        "dev.angelcorzo.nivo.config.."
                );

        rule.check(importedClasses);
    }

    @Test
    @DisplayName("Layered architecture rules are strictly enforced")
    void layeredArchitectureRules() {
        ArchRule rule = layeredArchitecture()
                .consideringOnlyDependenciesInLayers()
                .layer("DomainModel").definedBy("dev.angelcorzo.nivo.domain.model..")
                .layer("DomainUseCase").definedBy("dev.angelcorzo.nivo.domain.usecase..")
                .layer("Infrastructure").definedBy("dev.angelcorzo.nivo.infrastructure..")
                .layer("Config").definedBy("dev.angelcorzo.nivo.config..")
                .whereLayer("DomainModel").mayOnlyBeAccessedByLayers("DomainUseCase", "Infrastructure", "Config")
                .whereLayer("DomainUseCase").mayOnlyBeAccessedByLayers("Infrastructure", "Config")
                .whereLayer("Infrastructure").mayNotBeAccessedByAnyLayer()
                .whereLayer("Config").mayNotBeAccessedByAnyLayer();

        rule.check(importedClasses);
    }

    @Test
    @DisplayName("UseCases should only have final fields")
    void useCasesShouldHaveOnlyFinalFields() {
        ArchRule rule = classes()
                .that()
                .haveSimpleNameEndingWith("UseCase")
                .should()
                .haveOnlyFinalFields()
                .allowEmptyShould(true);

        rule.check(importedClasses);
    }
}
